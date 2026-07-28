import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import bgImage from "../assets/pexels-evan-cameron-21436484-9495080.jpg";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">

      {/* Header — fond blanc opaque, z-50 pour que le dropdown passe au-dessus */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      {/* Fil d'Ariane — fond blanc, juste sous le header */}
      <div className="relative z-40 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      {/* Contenu — fond blanc pour toutes les pages sans exception */}
      <main className="relative flex-1 bg-white">
        {children}
      </main>

      {/* Footer avec image de fond uniquement ici */}
      <div
        className="relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative z-10">
          <Footer />
        </div>
      </div>

    </div>
  );
}
