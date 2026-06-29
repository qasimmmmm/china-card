import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhatIsIt } from '@/components/home/WhatIsIt'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Requirements } from '@/components/home/Requirements'
import { Features } from '@/components/home/Features'
import { SampleDocument } from '@/components/home/SampleDocument'
import { Pricing } from '@/components/home/Pricing'
import { WhoNeedsIt } from '@/components/home/WhoNeedsIt'
import { Faq } from '@/components/home/Faq'
import { FinalCta } from '@/components/home/FinalCta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <WhatIsIt />
      <HowItWorks />
      <Requirements />
      <Features />
      <SampleDocument />
      <Pricing />
      <WhoNeedsIt />
      <Faq />
      <FinalCta />
    </>
  )
}
