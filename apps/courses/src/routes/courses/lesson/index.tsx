import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from 'reactfire';
import {
  faBookOpen,
  faCheckCircle,
  faClock,
  faCube,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';

import { getLessonNumber } from '../_helpers';
import GridContainer from '../../../components/GridContainer';
import Icon from '../../../components/Icon';
import { getLinkPropsFromLink } from '../../../helpers';
import { handleErrors } from '../../../helpers';
import useToast from '../../../components/Toast';
import { handleLessonStart } from '../_firebase';
import { OpenMined } from '@openmined/shared/types';

const Detail = ({ title, value, icon = faCheckCircle }) => (
  <Flex align="center" mb={4}>
    <Icon icon={icon} boxSize={8} />
    <Box ml={4}>
      <Text fontWeight="bold">{title}</Text>
      <Text color="gray.700">{value}</Text>
    </Box>
  </Flex>
);

export default ({
  page,
  progress,
  user,
  ts,
  course,
  lesson,
}: OpenMined.CoursePagesProp) => {
  const db = useFirestore();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    course: { title: courseTitle, lessons },
    title,
    description,
    resources,
    firstConcept,
    learnFrom,
    learnHow,
    length,
    conceptsCount,
  } = page;

  // Set the width of the sidebar
  const SIDEBAR_WIDTH = 360;

  // Get the lesson's number
  const lessonNum = getLessonNumber(lessons, lesson);

  const onLessonStart = () => {
    handleLessonStart(db, user.uid, course, ts, progress, lesson)
      .then(() => {
        navigate(`/courses/${course}/${lesson}/${firstConcept}`);
      })
      .catch((error) => handleErrors(toast, error));
  };

  return (
    <GridContainer isInitial py={16}>
      <Flex direction={{ base: 'column-reverse', lg: 'row' }}>
        <Box
          bg="gray.100"
          borderRadius="md"
          p={6}
          width={{ base: 'full', lg: SIDEBAR_WIDTH }}
          flex={{ lg: `0 0 ${SIDEBAR_WIDTH}px` }}
          mr={{ lg: 16 }}
          mt={{ base: 8, lg: 0 }}
        >
          {length && <Detail title="Length" value={length} icon={faClock} />}
          {conceptsCount && (
            <Detail
              title="Concepts"
              value={`${conceptsCount} concepts`}
              icon={faCube}
            />
          )}
          {lessons && (
            <Detail
              title="Progress"
              value={`${lessonNum} of ${lessons.length} lessons`}
              icon={faBookOpen}
            />
          )}
          {learnFrom && (
            <>
              <Divider my={6} />
              <Heading as="p" size="sm">
                In this Lesson:
              </Heading>
              {learnFrom.map(({ credential, image, name }) => (
                <Flex key={name} align="center" mt={4}>
                  <Avatar src={image} size="lg" mr={4} />
                  <Box>
                    <Heading as="p" size="sm">
                      {name}
                    </Heading>
                    <Text fontSize="sm">{credential}</Text>
                  </Box>
                </Flex>
              ))}
            </>
          )}
          {resources && (
            <>
              <Divider my={6} />
              <Heading as="p" size="sm" mb={4}>
                Helpful Resources:
              </Heading>
              {resources.map(({ title, link }, index) => {
                const isExternal =
                  link.includes('http://') || link.includes('https://');
                return (
                  <Link
                    key={index}
                    display="block"
                    mt={2}
                    {...getLinkPropsFromLink(link)}
                  >
                    <Flex justify="space-between" align="center">
                      <Flex align="center">
                        <Text>{title}</Text>
                      </Flex>
                      {isExternal && <Icon icon={faExternalLinkAlt} />}
                    </Flex>
                  </Link>
                );
              })}
            </>
          )}
        </Box>
        <Box>
          <Text color="gray.700" mb={2}>
            <Text fontWeight="bold" as="span">
              {courseTitle}
            </Text>{' '}
            | Lesson {lessonNum}
          </Text>
          <Heading as="h1" size="xl">
            {title}
          </Heading>
          <Divider my={6} />
          <Text color="gray.700" mb={6}>
            {description}
          </Text>
          {learnHow && (
            <>
              <Heading as="p" size="md" mb={4}>
                In this lesson you'll:
              </Heading>
              <UnorderedList spacing={2} mb={6}>
                {learnHow.map((l) => (
                  <ListItem key={l} color="gray.700">
                    {l}
                  </ListItem>
                ))}
              </UnorderedList>
            </>
          )}
          <Button onClick={onLessonStart} colorScheme="blue">
            Begin Lesson
          </Button>
        </Box>
      </Flex>
    </GridContainer>
  );
};
