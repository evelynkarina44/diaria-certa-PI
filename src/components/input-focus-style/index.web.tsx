import React from 'react';

// Uma única regra cobre os campos de todas as telas e modais, inclusive novos formulários.
// As bordas normais/de erro ficam intactas; o teclado mantém uma indicação discreta de foco.
export function InputFocusStyle() {
  return <style>{`
    input:focus,
    textarea:focus,
    select:focus {
      outline: none !important;
    }

    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
      box-shadow: inset 0 -2px 0 #18C7C8;
    }
  `}</style>;
}
