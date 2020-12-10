import React, { useEffect, useState } from 'react';
import { useFirestore } from 'reactfire';
import { Box } from '@chakra-ui/core';
import useScrollPosition from '@react-hook/window-scroll';
import { faBookOpen, faLink } from '@fortawesome/free-solid-svg-icons';
import Page from '@openmined/shared/util-page';

import CourseContent from './content';

import {
  getConceptIndex,
  getLessonIndex,
  hasCompletedConcept,
  hasStartedConcept,
} from '../_helpers';
import CourseHeader from '../../../components/CourseHeader';
import CourseFooter from '../../../components/CourseFooter';

export default ({ progress, page, user, ts, course, lesson, concept }) => {
  const db = useFirestore();

  const {
    concept: { title },
    concepts,
    course: { lessons },
    resources,
    title: lessonTitle,
  } = page;

  useEffect(() => {
    // If we haven't started the concept
    if (!hasStartedConcept(progress, lesson, concept)) {
      const data = progress;

      // Then the concept data structure inside that
      data.lessons[lesson].concepts[concept] = {
        started_at: ts(),
      };

      // When the object is constructed, store it!
      db.collection('users')
        .doc(user.uid)
        .collection('courses')
        .doc(course)
        .set(data, { merge: true });
    }
  }, [user.uid, db, progress, ts, course, lessons, lesson, concept]);

  // We need to track the user's scroll progress, as well as whether or not they've hit the bottom at least once
  const scrollY = useScrollPosition();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // This is the logic to track their scroll progress and so on
  useEffect(() => {
    const conceptHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress =
      conceptHeight <= 0 ? 100 : (scrollY / conceptHeight) * 100 || 0;

    setScrollProgress(progress > 100 ? 100 : progress);

    if (scrollProgress === 100 && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [scrollY, scrollProgress, hasScrolledToBottom]);

  // We also need to track if the user has completed all quizzes for this concept
  const [hasCompletedAllQuizzes, setHasCompletedAllQuizzes] = useState(false);

  // Get the current lesson and concept indexes, and their non-zero numbers
  const lessonIndex = getLessonIndex(lessons, lesson);
  const lessonNum = lessonIndex + 1;
  const conceptIndex = getConceptIndex(lessons, lesson, concept);
  const conceptNum = conceptIndex + 1;

  // Create a function that is triggered when the concept is completed
  // This is triggered by clicking the "Next" button in the <ConceptFooter />
  const onCompleteConcept = () =>
    new Promise((resolve, reject) => {
      // If we haven't already completed this concept...
      if (!hasCompletedConcept(progress, lesson, concept)) {
        // Tell the DB we've done so
        db.collection('users')
          .doc(user.uid)
          .collection('courses')
          .doc(course)
          .set(
            {
              lessons: {
                [lesson]: {
                  concepts: {
                    [concept]: {
                      completed_at: ts(),
                    },
                  },
                },
              },
            },
            { merge: true }
          )
          .then(resolve)
          .catch(reject);
      } else {
        resolve();
      }
    });

  // We need a function to be able to provide feedback for this concept
  const onProvideFeedback = (value, feedback = null) =>
    db
      .collection('users')
      .doc(user.uid)
      .collection('feedback')
      .doc(concept)
      .set(
        {
          value,
          feedback,
          type: 'concept',
        },
        { merge: true }
      );

  // Set up the content for the left-side drawer in the <ConceptHeader />
  const leftDrawerSections = [
    {
      title: 'Concepts',
      icon: faBookOpen,
      fields: concepts.map(({ _id, title }, index) => {
        // Default concept status is "unavailable"
        let status = 'unavailable';

        // If they've started the concept
        if (hasStartedConcept(progress, lesson, _id)) {
          // And they've also completed it
          if (hasCompletedConcept(progress, lesson, _id)) status = 'completed';
          // Otherwise, it must be available
          else status = 'available';
        }

        // On the other hand, perhaps it's the first concept, in which casee it's definitely available
        else if (index === 0) status = 'available';

        return {
          status,
          title,
          link:
            status !== 'unavailable'
              ? `/courses/${course}/${lesson}/${_id}`
              : null,
        };
      }),
    },
    {
      title: 'Resources',
      icon: faLink,
      fields: resources ? resources : [],
    },
  ];

  // Given the content we need to render... what's the type of the first piece?
  const firstContentPiece = page.concept.content[0]._type;

  // We need to store the previous concept id and the next concept id to know where to link
  const prevConceptId =
    conceptIndex - 1 < 0 ? '' : concepts[conceptIndex - 1]._id;
  const nextConceptId =
    conceptNum === concepts.length
      ? 'complete'
      : concepts[conceptIndex + 1]._id;

  // Determine whether the next concept should be available or not to the user
  const [isNextAvailable, setIsNextAvailable] = useState(false);

  useEffect(() => {
    const should =
      (firstContentPiece !== 'video' &&
        hasScrolledToBottom &&
        hasCompletedAllQuizzes) ||
      (firstContentPiece === 'video' && hasCompletedAllQuizzes) ||
      hasCompletedConcept(progress, lesson, concept);

    if (should && !isNextAvailable) {
      setIsNextAvailable(should);
    }
  }, [
    progress,
    lesson,
    concept,
    isNextAvailable,
    firstContentPiece,
    hasCompletedAllQuizzes,
    hasScrolledToBottom,
  ]);

  return (
    <Page title={`${lessonTitle} - ${title}`}>
      <Box bg="gray.800">
        <CourseHeader
          subtitle={`Lesson ${lessonNum}`}
          title={title}
          course={course}
          leftDrawerSections={leftDrawerSections}
        />
        <CourseContent
          page={page}
          progress={progress}
          course={course}
          lesson={lesson}
          concept={concept}
          conceptNum={conceptNum}
          setCompletedQuizzes={setHasCompletedAllQuizzes}
        />
        <CourseFooter
          current={conceptNum}
          total={concepts.length}
          scrollProgress={scrollProgress}
          isBackAvailable={conceptIndex > 0}
          isNextAvailable={isNextAvailable}
          backLink={`/courses/${course}/${lesson}/${prevConceptId}`}
          nextLink={`/courses/${course}/${lesson}/${nextConceptId}`}
          onCompleteConcept={onCompleteConcept}
          onProvideFeedback={onProvideFeedback}
        />
      </Box>
    </Page>
  );
};
