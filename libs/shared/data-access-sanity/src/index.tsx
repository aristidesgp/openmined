import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Code,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from '@chakra-ui/core';
import { Link as RRDLink } from 'react-router-dom';
import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import BlockContent from '@sanity/block-content-to-react';

const SanityContext = createContext(null);

export const SanityProvider = ({ sanityConfig, children }) => {
  const client = sanityClient(sanityConfig);
  const builder = imageUrlBuilder(client);

  return (
    <SanityContext.Provider value={{ client, imageBuilder: builder }}>
      {children}
    </SanityContext.Provider>
  );
};

const processChildren = (children, markDefs) =>
  children.map(({ text, marks }) => {
    let finalElem = text;

    if (marks.length > 0) {
      finalElem = marks.map((m, i) => {
        if (m === 'strong') {
          return (
            <Text key={i} as="span" fontWeight="bold">
              {finalElem}
            </Text>
          );
        } else if (m === 'em') {
          return (
            <Text key={i} as="span" fontStyle="italic">
              {finalElem}
            </Text>
          );
        } else if (m === 'underline') {
          return (
            <Text key={i} as="span" textDecoration="underline">
              {finalElem}
            </Text>
          );
        } else if (m === 'strike-through') {
          return (
            <Text key={i} as="span" textDecoration="line-through">
              {finalElem}
            </Text>
          );
        } else if (m === 'code') {
          return <Code key={i}>{finalElem}</Code>;
        } else {
          const extra = markDefs[m];

          if (extra._type === 'link') {
            const isExternal =
              extra.href.includes('http://') || extra.href.includes('https://');

            const linkProps = isExternal
              ? {
                  as: 'a',
                  href: extra.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : {
                  as: RRDLink,
                  to: extra.href,
                };

            return (
              <Link key={i} {...linkProps}>
                {finalElem}
              </Link>
            );
          }

          return <Text key={i}>{finalElem}</Text>;
        }
      });
    }

    return finalElem;
  });

const blockRenderer = (props) => {
  const markDefs = {};
  const { style = 'normal' } = props.node;

  props.node.markDefs.forEach(({ _key, ...i }) => (markDefs[_key] = i));

  const children = processChildren(props.node.children, markDefs);

  if (style === 'normal') {
    return <Text mb={4}>{children}</Text>;
  }

  if (/^h\d/.test(style)) {
    const level = style.replace(/[^\d]/g, '');

    let size;

    if (+level === 2) size = 'xl';
    else if (+level === 3) size = 'lg';
    else if (+level === 4) size = 'md';
    else if (+level === 5) size = 'sm';
    else if (+level === 6) size = 'xs';

    return (
      <Heading size={size} as={`h${level}`} mb={4}>
        {children}
      </Heading>
    );
  }

  if (style === 'blockquote') {
    return (
      <Text mb={4} fontStyle="italic" color="gray.700" bg="gray.100" p={4}>
        {children}
      </Text>
    );
  }

  return BlockContent.defaultSerializers.types.block(props);
};

const listRenderer = ({ type, level, children }) => {
  const ListElem = type === 'bullet' ? UnorderedList : OrderedList;
  let styleType;

  if (type === 'bullet') {
    if (level % 3 === 1) styleType = 'disc';
    else if (level % 3 === 2) styleType = 'circle';
    else if (level % 3 === 0) styleType = 'square';
  } else {
    if (level % 3 === 1) styleType = 'decimal';
    else if (level % 3 === 2) styleType = 'lower-alpha';
    else if (level % 3 === 0) styleType = 'lower-roman';
  }

  return (
    <ListElem mb={level === 1 ? 4 : 0} styleType={styleType}>
      {children.map((elem, i) => (
        <ListItem key={i}>{elem.props.children}</ListItem>
      ))}
    </ListElem>
  );
};

export const RichText = ({ content }) => (
  <BlockContent
    blocks={content}
    serializers={{ types: { block: blockRenderer }, list: listRenderer }}
  />
);

export const useSanityImage = (src) => {
  const { imageBuilder } = useContext(SanityContext);

  return imageBuilder.image(src);
};

export const useSanity = (query) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { client } = useContext(SanityContext);

  const prepareData = (d) => {
    Object.keys(d).forEach((i) => {
      const elem = d[i];

      // Make sure we convert all breaking spaces to <br /> tags
      if (typeof elem === 'string' && elem.includes('\n')) {
        d[i] = (
          <span
            dangerouslySetInnerHTML={{
              __html: elem.split('\n').join('<br />'),
            }}
          />
        );
      }
    });

    return d;
  };

  useEffect(() => {
    client
      .fetch(query)
      .then((d) => {
        setData(prepareData(d));
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, [client, query]);

  return { data, loading, error };
};
