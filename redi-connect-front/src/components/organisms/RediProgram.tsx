import React from "react";
import {
  Container,
  Section,
  Columns,
  Image,
  Level,
  Heading,
} from "react-bulma-components";
import career from "../../assets/images/career.svg";
import search from "../../assets/images/search.svg";
import calender from "../../assets/images/calender.svg";
import offline from "../../assets/images/offline.svg";
import Title from "../molecules/Title";

const programSteps = [
  {
    image: search,
    content: "Connect yourself with the right mentor/mentee ",
    headline: "1. Set up your profile",
  },
  {
    image: career,
    content: "Get/ give career and personal advice and support ",
    headline: "2. Get connected",
  },
  {
    image: calender,
    content: "Schedule meetings to stay on track",
    headline: "3. Plan meetings",
  },
  {
    image: offline,
    content: "Get advice on how to best connect offline",
    headline: "4. Meet in real life",
  },
];

const RediProgram = () => {
  return (
    <Section>
      <Container>
        <Title
          teaser="about redi connect"
          headline="What our Mentorship Program is all about ..."
        />
        <Columns>
          {programSteps.map((step) => (
            <Columns.Column className="has-text-centered" key={step.content}>
              <Image src={step.image} />
              <Heading
                size={4}
                renderAs="h3"
                className="is-marginless"
                responsive={{ tablet: { hide: { value: true } } }}
                style={{ paddingTop: 12 }}
              >
                {step.headline}
              </Heading>
              <Level
                className="is-size-4 is-size-5-mobile has-text-black"
                style={{ marginBottom: 24, marginTop: 8 }}
              >
                {step.content}
              </Level>
            </Columns.Column>
          ))}
        </Columns>
      </Container>
    </Section>
  );
};

export default RediProgram;
