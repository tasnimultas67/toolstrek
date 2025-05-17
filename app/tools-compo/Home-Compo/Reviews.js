import * as motion from "motion/react-client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Marketing Director, TechCorp",
    description:
      "The service exceeded all our expectations. Our engagement metrics improved by 150% within just two months of implementation. The team was professional, responsive, and truly understood our needs.",
  },
  {
    name: "Michael Chen",
    position: "CEO, Startup Ventures",
    description:
      "Absolutely transformative for our business. The insights we gained helped us pivot our strategy at just the right time. I recommend this to every entrepreneur I meet.",
  },
  {
    name: "Emily Rodriguez",
    position: "Product Manager, DesignHub",
    description:
      "Working with this team was a game-changer. They delivered ahead of schedule and the quality was exceptional. We've already signed up for another year of service.",
  },
  {
    name: "David Wilson",
    position: "CTO, FinTech Solutions",
    description:
      "The technical implementation was flawless. Their engineers understood our complex architecture immediately and integrated seamlessly with our existing systems.",
  },
  {
    name: "Jessica Kim",
    position: "Director of Operations, HealthPlus",
    description:
      "Customer support is outstanding - available 24/7 with real solutions. We've reduced our operational costs by 30% while improving service quality.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Reviews = () => {
  return (
    <section className="w-full m-auto py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container m-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold  sm:text-4xl md:text-5xl">
            What Our Clients Say
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-base dark:text-gray-400">
            Don't just take our word for it. Here's what our clients have to say
            about their experiences.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="flex flex-col justify-between p-6 h-full">
                        <div className="space-y-4">
                          <p className="text-gray-600 dark:text-gray-400">
                            "{testimonial.description}"
                          </p>
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {testimonial.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {testimonial.position}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
