import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  RadioGroup,
  Alert,
  Box,
  Text,
  CheckboxGroup,
  Stack,
  Link,
} from '@chakra-ui/react';
import TempRadio from '../../../components/TempRadio';
import TempCheckbox from '../../../components/TempCheckbox';

const SidebarItem = ({
  title,
  value,
  setter,
  options,
  multiple = false,
  ...props
}) => (
  <AccordionItem key={title} border={0} {...props}>
    <AccordionButton
      borderBottomWidth={2}
      borderBottomColor="gray.300"
      borderBottomStyle="solid"
    >
      <Box flex="1" textAlign="left" fontSize="xl" fontWeight="bold">
        {title}
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel pb={4}>
      {multiple ? (
        <CheckboxGroup colorScheme="blue" onChange={setter} value={value}>
          <Stack direction="column" align="flex-start">
            {options.map((item) => (
              <TempCheckbox key={item} value={item} onChange={setter}>
                {item}
              </TempCheckbox>
            ))}
          </Stack>
        </CheckboxGroup>
      ) : (
        <RadioGroup colorScheme="blue" value={value}>
          <Stack>
            {options.map((item) => (
              <TempRadio onChange={setter} value={item} key={item}>
                {item}
              </TempRadio>
            ))}
          </Stack>
        </RadioGroup>
      )}
    </AccordionPanel>
  </AccordionItem>
);

export default ({ filters, numCourses, clearFilters }) => {
  const numFilters = filters.filter((filter) => !(filter.value.length === 0))
    .length;

  return (
    <>
      {numFilters !== 0 && (
        <Alert
          fontWeight="bold"
          flexDirection="column"
          alignItems="start"
          borderRadius={4}
          bgColor="cyan.50"
          mb={4}
        >
          <Text mb={4} color="cyan.800">
            {numCourses} results
          </Text>
          <Link
            color="cyan.800"
            _hover={{ color: 'cyan.900' }}
            onClick={clearFilters}
          >
            Clear filters ({numFilters})
          </Link>
        </Alert>
      )}
      <Accordion allowMultiple allowToggle>
        {filters.map((filter) => (
          <SidebarItem key={filter.title} {...filter} />
        ))}
      </Accordion>
    </>
  );
};
