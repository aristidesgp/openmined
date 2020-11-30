import React from 'react';
import { Box, Text, Button, Flex, Divider, Link } from '@chakra-ui/core';

import GridContainer from './GridContainer';

import content from '../content/footer';

const FooterSection = ({ title, children, ...props }) => (
  <Box {...props}>
    <Text my={4} color="gray.50" fontFamily="heading" fontSize="20px">
      {title}
    </Text>
    {children}
  </Box>
);

export default (props) => {
  const {
    catalog,
    resources,
    about: { title, description, button },
    bottom: { copyright, terms_and_conditions, privacy_policy },
  } = content;

  return (
    <Box
      position="relative"
      zIndex={2}
      bg="gray.900"
      color="white"
      py={8}
      {...props}
    >
      <GridContainer>
        <Flex direction={['column', null, null, 'row']} justify="space-between">
          <FooterSection width={['100%', null, null, 1 / 2]} title={title}>
            <Text color="gray.400" my={4}>
              {description}
            </Text>
            <Button
              my={4}
              as="a"
              href={button.link}
              target="_blank"
              color="gray.200"
              bgColor="gray.800"
              boxShadow="0px 4px 16px rgba(0, 0, 0, 0.3)"
            >
              {button.text}
            </Button>
          </FooterSection>
          <FooterSection title={catalog.title}>
            <Flex flexDirection="column">
              {catalog.courses.map(({ name, link }, i) => (
                <Link
                  key={i}
                  href={link}
                  target="_blank"
                  color="gray.400"
                  _hover={{ color: 'white' }}
                  mt={i === 0 ? 0 : 2}
                >
                  {name}
                </Link>
              ))}
            </Flex>
          </FooterSection>
          <FooterSection title={resources.title}>
            <Flex flexDirection="column">
              {resources.links.map(({ name, link }, i) => (
                <Link
                  key={i}
                  href={link}
                  target="_blank"
                  color="gray.400"
                  rel="noopener noreferrer"
                  _hover={{ color: 'white' }}
                  mt={i === 0 ? 0 : 2}
                >
                  {name}
                </Link>
              ))}
            </Flex>
          </FooterSection>
        </Flex>
        <Flex
          direction={['column', null, null, 'row']}
          pt={16}
          justifyContent="space-between"
        >
          <Text fontSize="sm" color="gray.600">
            {copyright}
          </Text>
          <Flex pt={[4, null, null, 0]}>
            <Link
              _hover={{ color: 'white' }}
              fontSize="sm"
              color="gray.600"
              href={terms_and_conditions.link}
            >
              {terms_and_conditions.name}
            </Link>
            <Divider orientation="vertical" mx={[2, null, null, 4]} />
            <Link
              _hover={{ color: 'white' }}
              fontSize="sm"
              color="gray.600"
              href={privacy_policy.link}
            >
              {privacy_policy.name}
            </Link>
          </Flex>
        </Flex>
      </GridContainer>
    </Box>
  );
};
