import { Button } from "@/components/ui/button"
import Image from "next/image"

const Home = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen border-amber-400">

        {/* Hero Section */}
        <section>
          <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 top-[700px] md:top-[500px] lg:top-[0px] xl:top-[0px] border-amber-900">
            <div className="flex flex-row items-center justify-center gap-[100px] h-screen text-center">
              <div>
                <Image
                  src="/assets/amico.png"
                  alt="Logo"
                  width={500}
                  height={495}
                  className="mx-auto mb-4 top-[200px] md:top-[100px] lg:top-[0px] xl:top-[0px] w-full h-auto"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
              <div className="flex flex-col items-center justify-center ">
                <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
                  Turn Chores Into Cheers!
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  Help your kids learn money smarts and have a blast doing it
                </p>
                <Button className="bg-[#500061] hover:bg-[#9514b7] text-white font-semibold py-2 px-4 rounded mt-4 w-[238px] h-10">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>

      </div>

    </>
  )
}
export default Home
