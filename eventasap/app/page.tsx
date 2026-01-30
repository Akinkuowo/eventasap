import Header from "@/components/header";
import Hero from "@/components/hero";
import CategorySection from "@/components/category-section";
import UniqueServices from "@/components/unique-services";
import PopularEvents from "@/components/popular-events";
import TrustedBrands from "@/components/trusted-brands";
import NewEvents from "@/components/new-events";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategorySection />
      <UniqueServices />
      <PopularEvents />
      <TrustedBrands />
      <NewEvents />
      <Footer />
    </main>
  );
}
