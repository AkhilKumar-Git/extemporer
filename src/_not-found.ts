
import Link from 'next/link';
import React from 'react';

export default function NotFound(): React.ReactElement {
  return React.createElement('div', 
    { style: { textAlign: 'center', marginTop: '50px' } },
    React.createElement('h1', null, '404 - Page Not Found'),
    React.createElement('p', null, 'Sorry, the page you are looking for does not exist.'),
    React.createElement(Link, 
      { href: '/' }, 
      'Go back to Homepage'
    )
  );
}

