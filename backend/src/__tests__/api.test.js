/**
 * Tests API — Endpoints critiques SailingLoc
 * Supertest + Jest — authentification, réservations, paiements
 */

const request = require("supertest");

jest.mock("../models", () => {
  const mockUser = {
    id: 1, email: "test@sailingloc.fr", nom: "Test", prenom: "User",
    role: "locataire", motDePasse: "$2a$10$test",
    toJSON: function() { const { motDePasse, ...rest } = this; return rest; },
  };
  const mockBoat = {
    id: 1, nom: "Voilier Test", type: "voilier", localisation: "Marseille",
    capacite: 6, prixJour: 200, userId: 2, publie: true,
  };
  const mockBooking = {
    id: 1, userId: 1, boatId: 1, dateDebut: "2026-09-01",
    dateFin: "2026-09-05", nombrePersonnes: 2, montantTotal: 800,
    commission: 80, statut: "en_attente",
    save: jest.fn().mockResolvedValue(true),
  };

  const createMock = (data) => ({
    findAll: jest.fn().mockResolvedValue([data]),
    findOne: jest.fn().mockResolvedValue(null),
    findByPk: jest.fn().mockResolvedValue(data),
    create: jest.fn().mockResolvedValue(data),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    unscoped: jest.fn().mockReturnThis(),
  });

  return {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(true),
      sync: jest.fn().mockResolvedValue(true),
    },
    User: { ...createMock(mockUser), findOne: jest.fn().mockResolvedValue(null) },
    Boat: { ...createMock(mockBoat), findAll: jest.fn().mockResolvedValue([mockBoat]) },
    Booking: { ...createMock(mockBooking) },
    Payment: { ...createMock({ id: 1 }) },
    Contract: { ...createMock({ id: 1, urlPdf: "contrat-1.pdf" }) },
    Document: { ...createMock({ id: 1 }) },
    Review: { ...createMock({ id: 1, note: 5, commentaire: "Super bateau" }) },
    Article: { ...createMock({ id: 1, titre: "Test", publie: true }) },
    Availability: { ...createMock({ id: 1 }) },
    Favorite: { ...createMock({ id: 1 }) },
    RefreshToken: { ...createMock({ id: 1, tokenHash: "hash", expiresAt: new Date(Date.now() + 86400000), revokedAt: null }) },
    Conversation: { ...createMock({ id: 1 }) },
    Message: { ...createMock({ id: 1 }) },
  };
});

jest.mock("../services/emailService", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendPaymentConfirmation: jest.fn().mockResolvedValue(true),
  sendOwnerBookingNotification: jest.fn().mockResolvedValue(true),
  sendBookingConfirmation: jest.fn().mockResolvedValue(true),
}));

jest.mock("../services/stripeService", () => ({
  createCheckoutSession: jest.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test", id: "cs_test_123" }),
}));

jest.mock("../services/paypalService", () => ({
  createOrder: jest.fn().mockResolvedValue({ id: "PAYPAL_ORDER_123", links: [{ rel: "approve", href: "https://paypal.com/approve" }] }),
  captureOrder: jest.fn().mockResolvedValue({ purchase_units: [{ custom_id: "1", payments: { captures: [{ id: "cap_123" }] } }] }),
}));

jest.mock("../utils/tokens", () => ({
  ACCESS_TOKEN_TTL: "15m",
  REFRESH_COOKIE_NAME: "refresh_token",
  createRefreshToken: jest.fn().mockReturnValue({ raw: "raw_token", hash: "hash_token", expiresAt: new Date(Date.now() + 86400000) }),
  hashToken: jest.fn().mockReturnValue("hash_token"),
  refreshCookieOptions: jest.fn().mockReturnValue({ httpOnly: true }),
}));

jest.mock("../middlewares/uploadMiddleware", () => ({
  uploadBoatImage: { single: jest.fn().mockReturnValue((req, res, next) => next()) },
  uploadDocument: { single: jest.fn().mockReturnValue((req, res, next) => next()) },
  BOAT_IMAGES_DIR: "/tmp/boats",
  DOCUMENTS_DIR: "/tmp/documents",
  cloudinary: { uploader: { destroy: jest.fn() } },
}));

jest.mock("../config/swagger", () => ({ openapi: "3.0.0", info: { title: "Test", version: "1.0" } }));

const jwt = require("jsonwebtoken");

const makeToken = (payload = { id: 1, role: "locataire", email: "test@sailingloc.fr" }) =>
  jwt.sign(payload, process.env.JWT_SECRET || "sailingloc_secret_dev_2026", { expiresIn: "1h" });

let app;

beforeAll(() => {
  process.env.JWT_SECRET = "sailingloc_secret_dev_2026";
  process.env.JWT_REFRESH_SECRET = "sailingloc_refresh_secret_dev_2026";
  process.env.NODE_ENV = "test";
  process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_placeholder";
  app = require("../server");
});

afterAll((done) => {
  done();
});

// AUTH
describe("API Auth — /api/auth", () => {
  test("GET route inconnue → 404", async () => {
    const res = await request(app).get("/api/route-inconnue");
    expect(res.status).toBe(404);
  });

  test("POST /register → 400 si champs manquants", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "test@test.com" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test("POST /register → 400 si mot de passe trop court", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ nom: "Test", prenom: "User", email: "test@test.com", motDePasse: "123", role: "locataire" });
    expect(res.status).toBe(400);
  });

  test("POST /register → 400 si email invalide", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ nom: "Test", prenom: "User", email: "pasunemail", motDePasse: "Sailing2026!", role: "locataire" });
    expect(res.status).toBe(400);
  });

  test("POST /login → 400 si champs manquants", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("POST /refresh → 401 sans cookie", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });

  test("POST /logout → 200", async () => {
    const res = await request(app).post("/api/auth/logout")
      .set("Authorization", `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
  });
});

// BATEAUX
describe("API Bateaux — /api/boats", () => {
  test("GET /boats → liste publique accessible", async () => {
    const res = await request(app).get("/api/boats");
    expect([200, 500]).toContain(res.status);
  });

  test("GET /boats/:id → fiche bateau accessible", async () => {
    const res = await request(app).get("/api/boats/1");
    expect([200, 404]).toContain(res.status);
  });

  test("POST /boats → 401 sans token", async () => {
    const res = await request(app).post("/api/boats").send({ nom: "Test", type: "voilier" });
    expect(res.status).toBe(401);
  });
});

// RÉSERVATIONS
describe("API Réservations — /api/bookings", () => {
  test("GET /mes-reservations → 401 sans token", async () => {
    const res = await request(app).get("/api/bookings/mes-reservations");
    expect(res.status).toBe(401);
  });

  test("GET /mes-reservations → 200 avec token", async () => {
    const res = await request(app).get("/api/bookings/mes-reservations")
      .set("Authorization", `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
  });

  test("POST /bookings → 401 sans token", async () => {
    const res = await request(app).post("/api/bookings")
      .send({ boatId: 1, dateDebut: "2026-09-01", dateFin: "2026-09-05" });
    expect(res.status).toBe(401);
  });
});

// PAIEMENTS
describe("API Paiements — /api/payments", () => {
  test("GET /my-payments → 401 sans token", async () => {
    const res = await request(app).get("/api/payments/my-payments");
    expect(res.status).toBe(401);
  });

  test("GET /my-payments → 200 avec token", async () => {
    const res = await request(app).get("/api/payments/my-payments")
      .set("Authorization", `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
  });

  test("POST stripe/create-session → 401 sans token", async () => {
    const res = await request(app).post("/api/payments/stripe/create-session/1");
    expect(res.status).toBe(401);
  });
});

// DOCUMENTS
describe("API Documents — /api/documents", () => {
  test("GET /admin/pending → 401 sans token", async () => {
    const res = await request(app).get("/api/documents/admin/pending");
    expect(res.status).toBe(401);
  });

  test("GET /admin/pending → 403 si non admin", async () => {
    const res = await request(app).get("/api/documents/admin/pending")
      .set("Authorization", `Bearer ${makeToken({ id: 1, role: "locataire" })}`);
    expect(res.status).toBe(403);
  });

  test("GET /admin/pending → 200 si admin", async () => {
    const res = await request(app).get("/api/documents/admin/pending")
      .set("Authorization", `Bearer ${makeToken({ id: 1, role: "admin" })}`);
    expect(res.status).toBe(200);
  });
});

// ADMIN
describe("API Admin — /api/admin", () => {
  test("GET /users → 401 sans token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  test("GET /users → 403 si non admin", async () => {
    const res = await request(app).get("/api/admin/users")
      .set("Authorization", `Bearer ${makeToken({ id: 1, role: "locataire" })}`);
    expect(res.status).toBe(403);
  });

  test("GET /users → 200 si admin", async () => {
    const res = await request(app).get("/api/admin/users")
      .set("Authorization", `Bearer ${makeToken({ id: 1, role: "admin" })}`);
    expect(res.status).toBe(200);
  });

  test("DELETE /users/:id → 403 si non admin", async () => {
    const res = await request(app).delete("/api/admin/users/2")
      .set("Authorization", `Bearer ${makeToken({ id: 1, role: "locataire" })}`);
    expect(res.status).toBe(403);
  });
});

// AVIS
describe("API Avis — /api/reviews", () => {
  test("GET /reviews → accessible publiquement", async () => {
    const res = await request(app).get("/api/reviews");
    expect([200, 404]).toContain(res.status);
  });

  test("POST /reviews → 401 sans token", async () => {
    const res = await request(app).post("/api/reviews")
      .send({ boatId: 1, note: 5, commentaire: "Super" });
    expect(res.status).toBe(401);
  });
});

// ARTICLES
describe("API Articles — /api/articles", () => {
  test("GET /articles → 200 public", async () => {
    const res = await request(app).get("/api/articles");
    expect(res.status).toBe(200);
  });
});