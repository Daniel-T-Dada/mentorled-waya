import { FadeInOld } from "@/components/animations/fade-in"
import { ScaleIn } from "@/components/animations/scale-in"
import { StaggerChildren } from "@/components/animations/stagger-children"
import { ScrollFadeIn, ScrollFadeInUp } from "@/components/animations/animate";
import { FeatureCard } from "@/components/feature-card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link";


const Home = () => {
  return (
    <>
      <div className="flex flex-col ">

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pt-32 md:pt-48">

            <div className="flex flex-col sm:flex-row items-center justify-around gap-16 lg:gap-16 lg:mx-32">
              <div className="">
                <ScaleIn className="relative w-full max-w-md" delay={0.2}>
                  <Image
                    src="/assets/saving-money.svg"
                    alt="Logo"
                    width={500}
                    height={495}
                    className="mx-auto mb-4 top-[100px] md:top-[100px] lg:top-[0px] xl:top-[0px] w-full h-auto"

                  />
                </ScaleIn>
              </div>

              <section className="">
                <div className="flex flex-col items-center sm:items-start dark:bg-gray-950">
                  <FadeInOld delay={0.3} direction="right">
                    <h1 className="text-[28px] lg:text-5xl font-bold mb-4 text-[#500061] dark:text-[#9333EA]">
                      Be the Hero, Do your Chores!
                    </h1>
                  </FadeInOld>
                  <FadeInOld delay={0.4} direction="right">
                    <p className="text-lg text-center sm:text-start md:text-xl text-gray-700  dark:text-gray-400 mb-6">
                      Help your kids learn money smarts
                      and have a blast doing it
                    </p>
                  </FadeInOld>

                  <FadeInOld delay={0.5} direction="right">
                    <Button className="bg-[#500061] hover:bg-[#9514b7] dark:bg-[#9333EA] text-white font-semibold py-[28px] px-4 rounded-full mt-4 w-[360px]  sm:w-[238px] lg:w-[238px] lg:h-10">
                      Get Started
                    </Button>
                  </FadeInOld>
                </div>
              </section>
            </div>

          </div>


          <section className="w-full md:h-20 lg:h-24  relative ">
            {/* The wavey lines */}
            <div >
              <div className="w-full h-auto absolute sm:-top-30 -top-80 lg:-top-60 left-0  animate-float -rotate-[4.62deg]">
                <Image
                  src="/assets/wave-1.svg"
                  width={3400}
                  height={10}
                  alt="Decorative wave pattern"
                  className="w-full h-auto"

                />
              </div>
              <div className="wave-svg w-full h-auto absolute -top-80 sm:-top-20 lg:-top-50 left-0 -z-50 opacity-70 animate-float-delayed">
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
        <section className="text-[#500061] dark:text-[#9333EA]">
          <div className="container mx-auto px-4 py-0 sm:py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center gap-8  lg:mx-32 md:mx-8 my-16 sm:my-0">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <FadeInOld delay={0.2} direction="left">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-brand dark:text-brand-light mb-4">Why we Built Waya</h2>
                </FadeInOld>

                <FadeInOld delay={0.3} direction="left">

                  <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl font-medium font text-gray-600 dark:text-gray-400">
                    At Waya, we believe that money lessons should be as easy as breathing and twice as fun. Our platform
                    turns everyday tasks into exciting opportunities for kids to learn, save, and grow their financial
                    confidence.
                  </p>
                </FadeInOld>
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
            <FadeInOld delay={0.2} direction="up">
              <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-center mb-4  text-[#500061] dark:text-[#9333EA]">
                What You&apos;ll Love About Waya
              </h2>
            </FadeInOld>
            <FadeInOld delay={0.3} direction="up">
              <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl dark:text-gray-400 text-center mb-12 font-semibold">
                Explore how Waya makes saving, spending, and earning feel like an adventure.
              </p>
            </FadeInOld>

            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
              <FeatureCard
                title="Chore and Allowance Management"
                description="Assign tasks and set allowance rules, teaching responsibility and reward the smart way."
                imageSrc="/assets/mobile-testing.svg"

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

            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mt-8 gap-8 lg:mx-64">
              <FeatureCard
                title="Financial Literacy Quizzes"
                description="Fun, bite-sized quizzes make complex money concepts easy and relatable for kids."
                imageSrc="/assets/financial-quiz.png"
              />
              <FeatureCard
                title="Family Dashboard"
                description="Stay connected, track each child's progress, savings, and learning achievements at a glance."
                imageSrc="/assets/analytics-dashboard.svg"
              />
            </StaggerChildren>
          </div>
        </section>

        {/* Ready to Raise a Money-Smart Kid? */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <ScrollFadeInUp>
              <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#500061] dark:text-[#9333EA] mb-2 text-center">
                Ready to Raise a Money-Smart Kid?
              </h2>
            </ScrollFadeInUp>
            <ScrollFadeInUp delay={0.1}>
              <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl dark:text-gray-400 text-center text-gray-700 mb-12 font-medium">
                Join Waya today and turn everyday life into a lifelong lesson with
                these three steps:
              </p>
            </ScrollFadeInUp>

            {/* Step Section */}
            <div className="mb-20 lg:mx-32 md:mx-8 my-16 sm:my-0">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                <div className="w-full md:w-1/2">
                  <ScrollFadeInUp delay={0.1}>
                    <h3 className="text-xl sm:text-xl md:text-2xl lg:text-4xl dark:text-[#9333EA] font-semibold text-[#500061] mb-2">
                      Ready to Build Smart Money Habits?
                    </h3>
                    <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl dark:text-gray-400  text-gray-700 mb-4">
                      Sign up and create a family account
                    </p>
                    <Link href="/signup">
                      <Button className="bg-[#500061] hover:bg-[#9514b7] text-white font-semibold py-3 px-6 rounded">
                        Sign Up
                      </Button>
                    </Link>
                  </ScrollFadeInUp>
                </div>
                <div className="w-full md:w-1/2">
                  <ScrollFadeIn delay={0.2}>
                    <Image
                      src="/assets/sign-up.svg"
                      alt="Sign up"
                      width={400}
                      height={400}
                      className="w-full h-auto"
                    />
                  </ScrollFadeIn>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
                <div className="w-full md:w-1/2">
                  <ScrollFadeInUp delay={0.1}>
                    <h3 className="text-xl sm:text-xl md:text-2xl lg:text-4xl dark:text-[#9333EA] font-semibold text-[#500061] mb-2">
                      Assign chores and allowances
                    </h3>
                    <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl dark:text-gray-400  text-gray-700 mb-4">
                      Set up a schedule of tasks and rewards for your kids to
                      complete
                    </p>
                  </ScrollFadeInUp>
                </div>
                <div className="w-full md:w-1/2">
                  <ScrollFadeIn delay={0.2}>
                    <Image
                      src="/assets/mobile-testing.svg"
                      alt="Mobile app"
                      width={400}
                      height={400}
                      className="w-full h-auto"
                    />
                  </ScrollFadeIn>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <ScrollFadeInUp delay={0.1}>
                    <h3 className="text-xl sm:text-xl md:text-2xl lg:text-4xl dark:text-[#9333EA] font-semibold text-[#500061] mb-2">
                      Watch your kids learn and grow!
                    </h3>
                    <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl dark:text-gray-400  text-gray-700 mb-4">
                      Track progress and celebrate financial milestones together
                    </p>
                  </ScrollFadeInUp>
                </div>
                <div className="w-full md:w-1/2">
                  <ScrollFadeIn delay={0.2}>
                    <Image
                      src="/assets/analytics-dashboard.svg"
                      alt="Analytics dashboard"
                      width={400}
                      height={400}
                      className="w-full h-auto"
                    />
                  </ScrollFadeIn>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <ScrollFadeInUp>
              <h2 className="text-3xl md:text-4xl font-bold text-[#500061] mb-12 text-center">
                Contact Us
              </h2>
            </ScrollFadeInUp>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#500061]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#500061]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#500061]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#500061]"
                  />
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#500061]"
                ></textarea>
              </div>

              <div>
                <Button className="w-full bg-[#500061] hover:bg-[#9514b7] text-white font-semibold py-3 px-6 rounded animate-shimmer shimmer">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </section>


      </div>

    </>
  )
}
export default Home
