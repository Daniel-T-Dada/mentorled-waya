import { FadeInOld } from "@/components/animations/fade-in";
import { ScaleIn } from "@/components/animations/scale-in";
import { StaggerChildren } from "@/components/animations/stagger-children";
import { ScrollFadeIn, ScrollFadeInUp } from "@/components/animations/animate";
import { FeatureCard } from "@/components/feature-card";
import { Button } from "@/components/ui/button";
import { Wave1, Wave2 } from "@/components/ui/inline-svgs";
import Image from "next/image";
import Link from "next/link";

// ========== UI Sub-components ==========

const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="container mx-auto px-4 pt-32 md:pt-48">
      <div className="flex flex-col sm:flex-row items-center justify-around gap-16 lg:gap-16 lg:mx-32">
        <ScaleIn className="relative w-full max-w-md" delay={0.2}>
          <Image
            src="/assets/saving-money.svg"
            alt="Children saving money illustration"
            width={500}
            height={495}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
            className="mx-auto mb-4 top-[100px] md:top-[100px] lg:top-[0px] xl:top-[0px] w-full h-auto dark:brightness-80 dark:contrast-80"
          />
        </ScaleIn>
        <div className="flex flex-col items-center sm:items-start">
          <FadeInOld delay={0.3} direction="right">
            <h1 className="text-[28px] lg:text-5xl font-bold mb-4 text-primary">
              Be the Hero, Do your Chores!
            </h1>
          </FadeInOld>
          <FadeInOld delay={0.4} direction="right">
            <p className="text-lg text-center sm:text-start md:text-xl text-muted-foreground mb-6">
              Help your kids learn money smarts and have a blast doing it
            </p>
          </FadeInOld>
          <FadeInOld delay={0.5} direction="right">
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 dark:text-foreground text-primary-foreground font-semibold py-[28px] px-4 rounded-full mt-4 w-[360px] sm:w-[238px] lg:w-[238px] lg:h-10">
                Get Started
              </Button>
            </Link>
          </FadeInOld>
        </div>
      </div>
    </div>
    <WavesSection />
  </section>
);

const WavesSection = () => (
  <section className="w-full md:h-20 lg:h-24  relative ">
    <div>
      <div className="w-full h-auto absolute sm:-top-30 -top-80 lg:-top-60 left-0 -z-10 animate-float -rotate-[4.62deg]">
        <Wave1 className="w-full h-auto" />
      </div>
      <div className="wave-svg w-full h-auto absolute -top-80 sm:-top-20 lg:-top-50 left-0 -z-50 opacity-70 animate-float-delayed">
        <Wave2 className="w-full h-auto" />
      </div>
    </div>
  </section>
);

const WhyWayaSection = () => (
  <section className="text-primary">
    <div className="container mx-auto px-4 py-0 sm:py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center gap-8  lg:mx-32 md:mx-8 my-16 sm:my-0">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <FadeInOld delay={0.2} direction="left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-primary mb-4">
              Why we Built Waya
            </h2>
          </FadeInOld>
          <FadeInOld delay={0.3} direction="left">
            <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl font-medium text-muted-foreground">
              At Waya, we believe that money lessons should be as easy as breathing and twice as fun. Our platform
              turns everyday tasks into exciting opportunities for kids to learn, save, and grow their financial confidence.
            </p>
          </FadeInOld>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <ScaleIn className="relative w-full max-w-md" delay={0.4}>
            <Image
              src="/assets/family-learning.svg"
              width={400}
              height={300}
              alt="Children learning about money with family"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="w-full h-auto dark:brightness-80 dark:contrast-80"
            />
          </ScaleIn>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="w-full py-12 md:py-16">
    <div className="container mx-auto px-4">
      <FadeInOld delay={0.2} direction="up">
        <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-center mb-4 text-primary">
          What You&apos;ll Love About Waya
        </h2>
      </FadeInOld>
      <FadeInOld delay={0.3} direction="up">
        <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl text-muted-foreground text-center mb-12 font-semibold">
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
          imageSrc="/assets/game-analytics.webp"
        />
        <FeatureCard
          title="Visual Wallets"
          description="Let kids track their savings and spending goals visually, helping them build smart habits early."
          imageSrc="/assets/e-wallet.webp"
        />
      </StaggerChildren>
      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mt-8 gap-8 lg:mx-64">
        <FeatureCard
          title="Financial Literacy Quizzes"
          description="Fun, bite-sized quizzes make complex money concepts easy and relatable for kids."
          imageSrc="/assets/financial-quiz.webp"
        />
        <FeatureCard
          title="Family Dashboard"
          description="Stay connected, track each child's progress, savings, and learning achievements at a glance."
          imageSrc="/assets/analytics-dashboard.svg"
        />
      </StaggerChildren>
    </div>
  </section>
);

const StepSection = ({
  step,
  title,
  description,
  image,
  reverse = false,
}: {
  step: number;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}) => (
  <div className={`flex flex-col md:flex-row${reverse ? "-reverse" : ""} items-center gap-8 mb-16`}>
    <div className="w-full md:w-1/2">
      <ScrollFadeInUp delay={0.1}>
        <h3 className="text-xl sm:text-xl md:text-2xl lg:text-4xl text-primary font-semibold mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl text-muted-foreground mb-4">
          {description}
        </p>
        {step === 1 && (
          <Link href="/auth/signup">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded">
              Sign Up
            </Button>
          </Link>
        )}
      </ScrollFadeInUp>
    </div>
    <div className="w-full md:w-1/2">
      <ScrollFadeIn delay={0.2}>
        <Image
          src={image}
          alt={title}
          width={400}
          height={400}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="w-full h-auto dark:brightness-80 dark:contrast-80"
        />
      </ScrollFadeIn>
    </div>
  </div>
);

const ReadySection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <ScrollFadeInUp>
        <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-primary mb-2 text-center">
          Ready to Raise a Money-Smart Kid?
        </h2>
      </ScrollFadeInUp>
      <ScrollFadeInUp delay={0.1}>
        <p className="text-sm sm:text-[18px] md:text-[18px] lg:text-2xl text-muted-foreground text-center mb-12 font-medium">
          Join Waya today and turn everyday life into a lifelong lesson with these three steps:
        </p>
      </ScrollFadeInUp>
      <div className="mb-20 lg:mx-32 md:mx-8 my-16 sm:my-0">
        <StepSection
          step={1}
          title="Ready to Build Smart Money Habits?"
          description="Sign up and create a family account"
          image="/assets/sign-up.svg"
        />
        <StepSection
          step={2}
          title="Assign chores and allowances"
          description="Set up a schedule of tasks and rewards for your kids to complete"
          image="/assets/mobile-testing.svg"
          reverse
        />
        <StepSection
          step={3}
          title="Watch your kids learn and grow!"
          description="Track progress and celebrate financial milestones together"
          image="/assets/analytics-dashboard.svg"
        />
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section className="py-16 md:py-24">
    <div className="container mx-auto px-4 max-w-3xl">
      <ScrollFadeInUp>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
          Contact Us
        </h2>
      </ScrollFadeInUp>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>
        <textarea
          placeholder="Your Message"
          rows={5}
          className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        ></textarea>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded">
          Submit
        </Button>
      </form>
    </div>
  </section>
);

// ========== Main Home Component ==========

const Home = async () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <WhyWayaSection />
      <FeaturesSection />
      <ReadySection />
      <ContactSection />
    </div>
  );
};

export default Home;