import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import AppGallery from "@/components/AppGallery"

export default function GalleryPage() {
  return (
    <>
      <Nav />
      <main className="relative z-[1] bg-white pt-24">
        <AppGallery />
      </main>
      <Footer />
    </>
  )
}
