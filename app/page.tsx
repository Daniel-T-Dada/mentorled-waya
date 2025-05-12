import { FadeIn } from "@/components/animations/fade-in"
import { ScaleIn } from "@/components/animations/scale-in"
import { StaggerChildren } from "@/components/animations/stagger-children"
import { FeatureCard } from "@/components/feature-card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const Home = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen">

        {/* Hero Section */}
        <section>
          <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 top-[100px] md:top-[500px] lg:top-[0px] xl:top-[0px] ">
            <div className="flex flex-row items-center justify-center gap-[100px] h-screen text-center">
              <div>
                <ScaleIn className="relative w-full max-w-md" delay={0.2}>
                  <Image
                    src="/assets/saving-money.svg"
                    alt="Logo"
                    width={500}
                    height={495}
                    className="mx-auto mb-4 top-[100px] md:top-[100px] lg:top-[0px] xl:top-[0px] w-full h-auto"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </ScaleIn>
              </div>

              <section>
                <div className="flex flex-col items-start  bg-white dark:bg-gray-950">
                  <FadeIn delay={0.3} direction="right">
                    <h1 className="text-5xl md:text-5xl font-bold text-primary mb-4">
                      Be the Hero, Do your Chores!
                    </h1>
                  </FadeIn>
                  <FadeIn delay={0.4} direction="right">
                    <p className="text-lg md:text-xl text-gray-600  dark:text-gray-300 mb-6">
                      Help your kids learn money smarts
                      and have a blast doing it
                    </p>
                  </FadeIn>

                  <FadeIn delay={0.5} direction="right">
                    <Button className="bg-[#500061] hover:bg-[#9514b7] text-white font-semibold py-[28px] px-4 rounded-full mt-4 w-[238px] h-10">
                      Get Started
                    </Button>
                  </FadeIn>
                </div>
              </section>
            </div>

          </div>


          <section className="w-full mt-8  h-40 md:h-32 relative ">
            {/* The wavey lines */}
            <div >
              <div className="wave-svg w-full h-auto absolute -top-90 left-0  animate-float -rotate-[4.62deg]">
                <Image
                  src="/assets/wave-1.svg"
                  width={3400}
                  height={10}
                  alt="Decorative wave pattern"
                  className="w-full h-auto"

                />
              </div>
              <div className="wave-svg w-full h-auto absolute -top-80 left-0 -z-50 opacity-70 animate-float-delayed">
                <Image
                  src="/assets/wave-2.svg"
                  width={3400}
                  height={10}
                  alt="Decorative wave pattern overlay"
                  className="w-full h-auto"

                />
              </div>
            </div>
          </section>


        </section>

        {/* Why WE Built Waya Section */}
        <section className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 top-[100px] md:top-[500px] lg:top-[0px] xl:top-[0px] ">
          <div className="container mx-auto px-4 ">
            <div className="flex flex-col md:flex-row items-center gap-8  mx-28">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <FadeIn delay={0.2} direction="left">
                  <h2 className="text-2xl md:text-3xl font-bold text-brand dark:text-brand-light mb-4">Why we Built Waya</h2>
                </FadeIn>

                <FadeIn delay={0.3} direction="left">

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    At Waya, we believe that money lessons should be as easy as breathing and twice as fun. Our platform
                    turns everyday tasks into exciting opportunities for kids to learn, save, and grow their financial
                    confidence.
                  </p>
                </FadeIn>
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                <ScaleIn className="relative w-full max-w-md" delay={0.4}>
                  <Image
                    src="/assets/family-learning.svg"
                    width={400}
                    height={300}
                    alt="Children learning about money"
                    className="w-full h-auto"
                  />
                </ScaleIn>
              </div>

            </div>

          </div>

        </section>

        {/* feature section */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4">
            <FadeIn delay={0.2} direction="up">
              <h2 className="text-2xl md:text-3xl font-bold text-brand dark:text-brand-light text-center mb-4">
                What You&apos;ll Love About Waya
              </h2>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12">
                Explore how Waya makes saving, spending, and earning feel like an adventure.
              </p>
            </FadeIn>

            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                title="Chore and Allowance Management"
                description="Assign tasks and set allowance rules, teaching responsibility and reward the smart way."
                imageSrc="/assets/mobile-testing.svg"
                svgImage={true}
              />
              <FeatureCard
                title="Gamified Learning"
                description="Kids unlock badges, complete challenges, and master money concepts through interactive games and quizzes."
                imageSrc="/assets/game-analytics.png"
              />
              <FeatureCard
                title="Visual Wallets"
                description="Let kids track their savings and spending goals visually, helping them build smart habits early."
                imageSrc="/assets/e-wallet.png"
              />
            </StaggerChildren>

            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mt-14">
              <FeatureCard
                title="Financial Literacy Quizzes"
                description="Fun, bite-sized quizzes make complex money concepts easy and relatable for kids."
                imageSrc="/assets/financial-quiz.png"
              />
              <FeatureCard
                title="Family Dashboard"
                description="Stay connected, track each child's progress, savings, and learning achievements at a glance."
                imageSrc="/assets/analytics-dashboard.svg"
                svgImage={true}
              />
            </StaggerChildren>
          </div>
        </section>




      </div>

    </>
  )
}
export default Home
