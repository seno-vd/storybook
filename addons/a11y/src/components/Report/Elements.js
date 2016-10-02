import React from 'react';

import Rules from './Rules';

const styles = {
  element: {
    fontWeight: 600,
  },
  target: {
    borderBottom: '1px solid rgb(130, 130, 130)',
    width: '100%',
    display: 'inline-block',
    paddingBottom: '4px',
    marginBottom: '4px',
  }
}

function Element({ element, passes }) {
  const { any, all, none } = element;

  const rules = [...any, ...all, ...none];

  return (
    <li style={styles.element}>
      <span style={styles.target}>
        {element.target[0]}
      </span>
      <Rules
        rules={rules}
        passes={passes}
      />
    </li>
  )
}

function Elements({ elements, passes }) {
  return (
    <ol style={styles.element}>
      {elements.map((element, index) => (
        <Element
          passes={passes}
          element={element}
          key={index}
        />
      ))}
    </ol>
  );
}

export default Elements;
