import React from 'react';
import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  Link,
  useToken,
  Stack,
  Divider,
} from '@chakra-ui/core';
import Page from '@openmined/shared/util-page';
import { useParams, Link as RRDLink, Navigate } from 'react-router-dom';
import { User } from '@openmined/shared/types';
import { useUser, useFirestoreDocDataOnce, useFirestore } from 'reactfire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faLink,
  faCog,
  faCommentAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

import GridContainer from '../../components/GridContainer';
import waveform from '../../assets/waveform/waveform-top-left-cool.png';

const SocialItem = ({ title, href, icon, ...props }) => (
  <Flex align="center" {...props}>
    <Icon as={FontAwesomeIcon} icon={icon} color="gray.800" mr={2} />
    <Link
      as="a"
      color="gray.700"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {title}
    </Link>
  </Flex>
);

const LinkItem = ({ title, icon, link, ...props }) => {
  const isExternal = link.includes('http://') || link.includes('https://');

  const linkProps = isExternal
    ? {
        as: 'a',
        target: '_blank',
        rel: 'noopener noreferrer',
        href: link,
      }
    : {
        as: RRDLink,
        to: link,
      };

  return (
    <Flex
      {...props}
      {...linkProps}
      align="center"
      p={3}
      width="full"
      bg="white"
      color="gray.700"
      borderRadius="md"
      _hover={{ bg: 'indigo.50', color: 'indigo.500' }}
      transitionProperty="background color"
      transitionDuration="normal"
      transitionTimingFunction="ease-in-out"
    >
      <Icon as={FontAwesomeIcon} icon={icon} size="lg" color="inherit" mr={3} />
      <Text color="inherit">{title}</Text>
    </Flex>
  );
};

export default () => {
  const gray50 = useToken('colors', 'gray.50');
  const user = useUser();
  const db = useFirestore();
  const { uid } = useParams();

  const dbUserRef = db.collection('users').doc(uid);
  const dbUser: User = useFirestoreDocDataOnce(dbUserRef);

  const isSameUser = user && uid === user.uid;
  const name = `${dbUser.first_name} ${dbUser.last_name}`;

  if (!Object.keys(dbUser).length) return <Navigate to="/" />;

  return (
    <Page
      title={name}
      description={dbUser.description}
      body={{ style: `background: ${gray50};` }}
    >
      <Box
        position="relative"
        _before={{
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '478px',
          height: '309px',
          zIndex: -1,
          backgroundImage: `url(${waveform})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0% 0%',
          backgroundSize: 'contain',
          display: ['none', null, null, 'block'],
        }}
      >
        <GridContainer isInitial pt={[8, null, null, 16]} pb={16}>
          <Flex direction={['column', null, null, 'row']}>
            <Flex
              direction="column"
              align={['center', null, null, 'flex-start']}
              width={['full', null, null, 280]}
            >
              <Avatar src={dbUser.photo_url} size="2xl" mb={4}>
                {isSameUser && (
                  <RRDLink to="/settings">
                    <AvatarBadge
                      bg="gray.800"
                      border={0}
                      boxSize="0.75em"
                      right={2}
                      bottom={2}
                    >
                      <Icon
                        as={FontAwesomeIcon}
                        icon={faPencilAlt}
                        color="white"
                        style={{ width: '0.35em' }}
                      />
                    </AvatarBadge>
                  </RRDLink>
                )}
              </Avatar>
              <Heading as="h1" size="lg" mb={4}>
                {name}
              </Heading>
              <Text color="gray.700" mb={6}>
                {dbUser.description}
              </Text>
              <Stack
                direction="column"
                align={['center', null, null, 'flex-start']}
                spacing={2}
              >
                {dbUser.github && (
                  <SocialItem
                    title={`@${dbUser.github}`}
                    href={`https://github.com/${dbUser.github}`}
                    icon={faGithub}
                  />
                )}
                {dbUser.twitter && (
                  <SocialItem
                    title={`@${dbUser.twitter}`}
                    href={`https://twitter.com/${dbUser.twitter}`}
                    icon={faTwitter}
                  />
                )}
                {dbUser.website && (
                  <SocialItem
                    title={dbUser.website}
                    href={dbUser.website}
                    icon={faLink}
                  />
                )}
              </Stack>
              {isSameUser && (
                <Box width="full">
                  <Divider my={6} />
                  <LinkItem
                    icon={faCog}
                    title="Account Settings"
                    link="/settings"
                    mb={2}
                  />
                  <LinkItem
                    icon={faCommentAlt}
                    title="Forum"
                    link="https://discussion.openmined.org"
                  />
                </Box>
              )}
            </Flex>
            <Box mt={{ base: 8, lg: 0 }} ml={{ lg: 12 }}>
              Finished courses and certificates go here!
              {/* TODO: Patrick, we need to put the finished courses here with a link to the certificate ON the card, not as a separate tab like in the designs */}
            </Box>
          </Flex>
        </GridContainer>
      </Box>
    </Page>
  );
};
