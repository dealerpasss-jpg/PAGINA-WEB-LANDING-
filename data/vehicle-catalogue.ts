export type CatalogueVehicle = {slug:string;title:string;price:number|null;availability?:'available'|'coming-soon'|'sold'|'unverified';specs:string[][];description:string;bodyStyle?:string;photoNotice?:string;originalPhotos?:boolean;referenceImage?:boolean;photos:{src:string;caption:string}[]};
export const vehicleCatalogue: CatalogueVehicle[] = [
  {
    slug: 'mazda6-grand-touring-2016',
    title: 'Mazda6 Grand Touring 2016',
    price: 850000,
    bodyStyle: 'Sedán',
    originalPhotos: true,
    specs: [['Año','2016'],['Versión','Grand Touring'],['Millaje','161.000 mi'],['Exterior','Blanco'],['Interior','Crema / marfil'],['Rines','Oscuros'],['Techo','Sunroof'],['Título','Limpio*']],
    description: 'Mazda6 Grand Touring blanco, con interior crema / marfil, rines oscuros y sunroof. El propietario reporta título limpio y ausencia de fallas mecánicas; esta información no sustituye una inspección independiente ni certifica el historial de accidentes. Las ocho fotografías originales permiten revisar el exterior, el interior y sus detalles de uso. Confirma la condición y disponibilidad antes de comprar.',
    photos: [
      {src:'/vehicles/mazda6-grand-touring-2016/portada.webp',caption:'Vista delantera en diagonal · fotografía original'},
      {src:'/vehicles/mazda6-grand-touring-2016/frente.webp',caption:'Vista frontal'},
      {src:'/vehicles/mazda6-grand-touring-2016/diagonal-opuesta.webp',caption:'Vista delantera opuesta'},
      {src:'/vehicles/mazda6-grand-touring-2016/trasera.webp',caption:'Vista trasera'},
      {src:'/vehicles/mazda6-grand-touring-2016/conductor.webp',caption:'Puesto de conducción y puerta del conductor'},
      {src:'/vehicles/mazda6-grand-touring-2016/asientos.webp',caption:'Asientos delanteros e interior crema / marfil'},
      {src:'/vehicles/mazda6-grand-touring-2016/consola.webp',caption:'Tablero, pantalla y consola central'},
      {src:'/vehicles/mazda6-grand-touring-2016/techo-interior.webp',caption:'Vista de la cabina y sunroof desde los asientos traseros'},
    ],
  },
  {
    slug: 'hyundai-elantra-eco-2018',
    title: 'Hyundai Elantra ECO 2018',
    price: 750000,
    bodyStyle: 'Sedán',
    photoNotice: 'Foto provisional: visualización de pintura. Fotos actualizadas próximamente.',
    specs: [['Año','2018'],['Versión','ECO'],['Millaje','104.609 mi'],['Combustible','Gasolina'],['Exterior','Blanco'],['Título','Limpio*'],['Estado actual','En proceso de pintura']],
    description: 'Elantra ECO blanco. Consulta su disponibilidad actual en esta ficha. El propietario reporta título limpio y buen funcionamiento del motor, la transmisión y el aire acondicionado; estos datos no sustituyen una inspección independiente. La única imagen disponible es una visualización de pintura, no una fotografía del acabado actual. Confirma la condición y disponibilidad antes de comprar.',
    photos: [{src:'/vehicles/hyundai-elantra-eco-2018/visualizacion-pintura.webp',caption:'Visualización de pintura · imagen editada, no representa necesariamente el estado actual'}],
  },
  {
    "slug": "nissan-versa-sr-2020",
    "title": "Nissan Versa SR 2020",
    "price": 790000,
    "bodyStyle": "Sedán",
    "referenceImage": true,
    "photoNotice": "Foto de referencia con fondo de presentación editado. Corresponde a otro ejemplar, no a esta unidad ni a su condición actual.",
    "specs": [
      [
        "Año",
        "2020"
      ],
      [
        "Versión",
        "SR"
      ],
      [
        "Millaje",
        "128.541 mi"
      ]
    ],
    "description": "Nissan Versa SR con millaje reportado de 128.541 millas. Consulta su disponibilidad actual en esta ficha. Precio de referencia provisional, sujeto a revisión de la condición real. El estado mecánico y la documentación están pendientes de confirmar; no se afirma título limpio. La foto de referencia corresponde a otro ejemplar del modelo, con fondo de presentación editado. No muestra esta unidad ni certifica su apariencia o equipamiento.",
    "photos": [
      {
        "src": "/vehicles/nissan-versa-sr-2020/referencia-real.webp",
        "caption": "Foto de referencia del modelo · fondo editado, no es esta unidad"
      }
    ]
  },
  {
    "slug": "audi-a4-premium-2017",
    "title": "Audi A4 Premium 2017",
    "price": 1090000,
    "bodyStyle": "Sedán",
    "referenceImage": true,
    "photoNotice": "Foto de referencia con fondo de presentación editado. Corresponde a otro ejemplar, no a esta unidad ni a su condición actual.",
    "specs": [
      [
        "Año",
        "2017"
      ],
      [
        "Versión",
        "Premium"
      ],
      [
        "Millaje",
        "107.203 mi"
      ]
    ],
    "description": "Audi A4 Premium con millaje reportado de 107.203 millas. Consulta su disponibilidad actual en esta ficha. Precio de referencia provisional, sujeto a revisión de la condición real. El estado mecánico y la documentación están pendientes de confirmar; no se afirma título limpio. La foto de referencia corresponde a otro ejemplar del modelo, con fondo de presentación editado. No muestra esta unidad ni certifica su apariencia o equipamiento.",
    "photos": [
      {
        "src": "/vehicles/audi-a4-premium-2017/referencia-real.webp",
        "caption": "Foto de referencia del modelo · fondo editado, no es esta unidad"
      }
    ]
  },
  {
    "slug": "volvo-s60-inscription-2019",
    "title": "Volvo S60 Inscription 2019",
    "price": 1290000,
    "bodyStyle": "Sedán",
    "referenceImage": true,
    "photoNotice": "Foto de referencia con fondo de presentación editado. Corresponde a otro ejemplar, no a esta unidad ni a su condición actual.",
    "specs": [
      [
        "Año",
        "2019"
      ],
      [
        "Versión",
        "Inscription"
      ],
      [
        "Millaje",
        "134.820 mi"
      ]
    ],
    "description": "Volvo S60 Inscription con millaje reportado de 134.820 millas. Consulta su disponibilidad actual en esta ficha. Precio de referencia provisional, sujeto a revisión de la condición real. La foto de referencia corresponde a otro ejemplar del modelo, con fondo de presentación editado. No muestra esta unidad ni certifica su condición, equipamiento o documentación.",
    "photos": [
      {
        "src": "/vehicles/volvo-s60-inscription-2019/referencia-real.webp",
        "caption": "Foto de referencia del modelo · fondo editado, no es esta unidad"
      }
    ]
  },
  {
    "slug": "jeep-wrangler-2017",
    "title": "Jeep Wrangler 2017",
    "price": null,
    "bodyStyle": "SUV",
    "specs": [
      [
        "Año",
        "2017"
      ],
      [
        "Millaje",
        "155.965 mi"
      ]
    ],
    "description": "Jeep Wrangler 2017, con millaje reportado de 155.965 millas. La portada es una visualización de referencia recreada con IA a partir de otro Wrangler JK Unlimited 2018. Se adaptaron el fondo, el techo, los rines, los estribos y la apariencia del parachoques; no es una fotografía de esta unidad ni confirma su condición o equipamiento. La fotografía original de esta unidad está disponible en la galería. El estado mecánico y la documentación están pendientes de confirmar. Consulta la disponibilidad actual en esta ficha.",
    "photos": [
      {
        "src": "/vehicles/jeep-wrangler-2017/portada.webp",
        "caption": "Referencia recreada con IA · otro ejemplar, no esta unidad"
      },
      {
        "src": "/vehicles/jeep-wrangler-2017/original.jpeg",
        "caption": "Vista delantera en diagonal · fotografía original de esta unidad"
      }
    ],
    "referenceImage": true,
    "photoNotice": "Portada de referencia recreada con IA, basada en otro ejemplar: no es esta unidad ni su condición actual. Foto original en la galería."
  },
  {
    "slug": "ford-escape-2014",
    "title": "Ford Escape 2014",
    "price": null,
    "bodyStyle": "SUV",
    "referenceImage": true,
    "photoNotice": "Portada de referencia con fondo editado: es otro ejemplar, no esta unidad ni su condición actual. Foto original en la galería.",
    "specs": [
      [
        "Año",
        "2014"
      ],
      [
        "Millaje",
        "160.383 mi"
      ]
    ],
    "description": "Ford Escape 2014, con millaje reportado de 160.383 millas. La portada es una imagen de referencia de otro ejemplar con fondo de presentación editado. La referencia muestra una Escape Titanium 2014 plateada; la versión y el equipamiento pueden diferir de esta unidad. La fotografía original de esta unidad está disponible en la galería. El estado mecánico y la documentación están pendientes de confirmar. Consulta la disponibilidad actual en esta ficha.",
    "photos": [
      {
        "src": "/vehicles/ford-escape-2014/portada.webp",
        "caption": "Referencia del modelo · fondo editado, no es esta unidad"
      },
      {
        "src": "/vehicles/ford-escape-2014/original.jpeg",
        "caption": "Vista delantera en diagonal · fotografía original de esta unidad"
      }
    ]
  },
  {
    "slug": "mercedes-benz-gla-250-2016",
    "title": "Mercedes-Benz GLA 250 2016",
    "price": null,
    "bodyStyle": "SUV",
    "specs": [
      [
        "Año",
        "2016"
      ],
      [
        "Versión",
        "GLA 250"
      ],
      [
        "Millaje",
        "108.119 mi"
      ]
    ],
    "description": "Mercedes-Benz GLA 250 2016, con millaje reportado de 108.119 millas. La portada es una visualización de referencia recreada con IA a partir de otro GLA 250 4MATIC 2015 de la misma generación. Se adaptaron el fondo, el color, los rines y el techo; el año, la tracción y el equipamiento del ejemplar usado como base pueden diferir de esta unidad. La fotografía original de esta unidad está disponible en la galería. El estado mecánico y la documentación están pendientes de confirmar. Consulta la disponibilidad actual en esta ficha.",
    "photos": [
      {
        "src": "/vehicles/mercedes-benz-gla-250-2016/portada.webp",
        "caption": "Referencia recreada con IA · otro ejemplar, no esta unidad"
      },
      {
        "src": "/vehicles/mercedes-benz-gla-250-2016/original.jpeg",
        "caption": "Vista delantera en diagonal · fotografía original de esta unidad"
      }
    ],
    "referenceImage": true,
    "photoNotice": "Portada de referencia recreada con IA, basada en otro ejemplar: no es esta unidad ni su condición actual. Foto original en la galería."
  },
  {
    "slug": "ford-escape-se-2016",
    "title": "Ford Escape SE 2016",
    "price": 600000,
    "specs": [
      [
        "Año",
        "2016"
      ],
      [
        "Versión",
        "SE"
      ],
      [
        "Millaje",
        "72.440 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Blanco"
      ],
      [
        "Interior",
        "Gris"
      ],
      [
        "Título",
        "Limpio*"
      ]
    ],
    "description": "Conoce las características de esta Escape y revisa sus fotos en detalle.",
    "photos": [
      {
        "src": "/vehicles/ford-escape-2016/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/ford-escape-2016/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/ford-escape-2016/diagonal.webp",
        "caption": "Vista delantera en diagonal"
      },
      {
        "src": "/vehicles/ford-escape-2016/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/ford-escape-2016/trasera-diagonal.webp",
        "caption": "Vista trasera en diagonal"
      },
      {
        "src": "/vehicles/ford-escape-2016/trasera.webp",
        "caption": "Vista trasera"
      },
      {
        "src": "/vehicles/ford-escape-2016/interior.webp",
        "caption": "Asientos e interior"
      },
      {
        "src": "/vehicles/ford-escape-2016/consola.webp",
        "caption": "Consola y transmisión automática"
      },
      {
        "src": "/vehicles/ford-escape-2016/millaje.webp",
        "caption": "Tablero · 72.440 millas"
      }
    ]
  },
  {
    "slug": "ford-edge-2021",
    "title": "Ford Edge 2021",
    "price": 1080000,
    "specs": [
      [
        "Año",
        "2021"
      ],
      [
        "Millaje",
        "140.000 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Blanco"
      ],
      [
        "Interior",
        "Beige"
      ],
      [
        "Título",
        "Limpio*"
      ],
      [
        "Propietarios",
        "2*"
      ],
      [
        "Ubicación",
        "Tampa, FL"
      ],
      [
        "Préstamo pendiente",
        "No*"
      ]
    ],
    "description": "Conoce las características de esta Edge y revisa sus fotos en detalle.",
    "photos": [
      {
        "src": "/vehicles/ford-edge-2021/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/ford-edge-2021/diagonal-1.webp",
        "caption": "Vista delantera original"
      },
      {
        "src": "/vehicles/ford-edge-2021/diagonal-2.webp",
        "caption": "Vista delantera opuesta"
      },
      {
        "src": "/vehicles/ford-edge-2021/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/ford-edge-2021/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/ford-edge-2021/trasera.webp",
        "caption": "Vista trasera"
      },
      {
        "src": "/vehicles/ford-edge-2021/asientos.webp",
        "caption": "Asientos traseros"
      },
      {
        "src": "/vehicles/ford-edge-2021/tablero.webp",
        "caption": "Tablero y consola"
      },
      {
        "src": "/vehicles/ford-edge-2021/interior-1.webp",
        "caption": "Interior beige"
      },
      {
        "src": "/vehicles/ford-edge-2021/interior-2.webp",
        "caption": "Consola y pantalla"
      },
      {
        "src": "/vehicles/ford-edge-2021/conductor.webp",
        "caption": "Asiento del conductor"
      }
    ]
  },
  {
    "slug": "ford-edge-titanium-2018",
    "title": "Ford Edge Titanium 2018",
    "price": 820000,
    "specs": [
      [
        "Año",
        "2018"
      ],
      [
        "Millaje",
        "116.842 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Plateado"
      ],
      [
        "Interior",
        "Negro"
      ],
      [
        "Título",
        "Limpio*"
      ],
      [
        "Propietarios",
        "2*"
      ],
      [
        "Ubicación",
        "Tampa, FL"
      ],
      [
        "Préstamo pendiente",
        "No*"
      ]
    ],
    "description": "Conoce las características de esta Edge y revisa sus fotos en detalle.",
    "photos": [
      {
        "src": "/vehicles/ford-edge-titanium-2018/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/diagonal-1.webp",
        "caption": "Vista delantera original"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/diagonal-2.webp",
        "caption": "Vista delantera opuesta"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/trasera.webp",
        "caption": "Vista trasera"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/diagonal-trasera.webp",
        "caption": "Vista trasera en diagonal"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/conductor.webp",
        "caption": "Interior del conductor"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/interior.webp",
        "caption": "Asientos delanteros"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/asientos.webp",
        "caption": "Asientos traseros y techo panorámico"
      },
      {
        "src": "/vehicles/ford-edge-titanium-2018/tablero.webp",
        "caption": "Tablero y consola"
      }
    ]
  },
  {
    "slug": "ford-explorer-xlt-2013",
    "title": "Ford Explorer XLT 2013",
    "price": 365000,
    "specs": [
      [
        "Año",
        "2013"
      ],
      [
        "Millaje",
        "200.000 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Negro"
      ],
      [
        "Interior",
        "Beige"
      ],
      [
        "Título",
        "Limpio*"
      ],
      [
        "Propietarios",
        "2*"
      ],
      [
        "Ubicación",
        "Tampa, FL 33619"
      ],
      [
        "Préstamo pendiente",
        "No*"
      ]
    ],
    "description": "Conoce las características de esta Explorer y revisa sus fotos en detalle.",
    "photos": [
      {
        "src": "/vehicles/ford-explorer-xlt-2013/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/diagonal-1.webp",
        "caption": "Vista delantera original"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/diagonal-2.webp",
        "caption": "Vista delantera opuesta"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/trasera.webp",
        "caption": "Vista trasera en diagonal"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/consola.webp",
        "caption": "Consola e interior beige"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/conductor.webp",
        "caption": "Asientos delanteros"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/tablero.webp",
        "caption": "Tablero y volante"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/asientos.webp",
        "caption": "Segunda fila de asientos"
      },
      {
        "src": "/vehicles/ford-explorer-xlt-2013/tercera-fila.webp",
        "caption": "Tercera fila de asientos"
      }
    ]
  },
  {
    "slug": "subaru-forester-2015",
    "title": "Subaru Forester 2015",
    "price": 600000,
    "specs": [
      [
        "Año",
        "2015"
      ],
      [
        "Millaje",
        "127.000 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Azul"
      ],
      [
        "Interior",
        "Gris oscuro de tela"
      ],
      [
        "Título",
        "Limpio*"
      ],
      [
        "Propietarios",
        "2*"
      ],
      [
        "Ubicación",
        "Tampa, FL 33602"
      ],
      [
        "Préstamo pendiente",
        "No*"
      ]
    ],
    "description": "Explora las fotografías originales y características de esta Subaru Forester.",
    "photos": [
      {
        "src": "/vehicles/subaru-forester-2015/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/subaru-forester-2015/diagonal-1.webp",
        "caption": "Vista delantera diagonal"
      },
      {
        "src": "/vehicles/subaru-forester-2015/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/subaru-forester-2015/diagonal-2.webp",
        "caption": "Vista delantera opuesta"
      },
      {
        "src": "/vehicles/subaru-forester-2015/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/subaru-forester-2015/trasera-diagonal.webp",
        "caption": "Vista trasera diagonal"
      },
      {
        "src": "/vehicles/subaru-forester-2015/trasera.webp",
        "caption": "Vista trasera"
      },
      {
        "src": "/vehicles/subaru-forester-2015/interior.webp",
        "caption": "Interior y asientos delanteros"
      },
      {
        "src": "/vehicles/subaru-forester-2015/volante.webp",
        "caption": "Volante y consola"
      }
    ]
  },
  {
    "slug": "subaru-impreza-2016",
    "title": "Subaru Impreza 2016",
    "price": 500000,
    "specs": [
      [
        "Año",
        "2016"
      ],
      [
        "Millaje",
        "120.000 mi"
      ],
      [
        "Transmisión",
        "Automática"
      ],
      [
        "Combustible",
        "Gasolina"
      ],
      [
        "Exterior",
        "Plateado"
      ],
      [
        "Interior",
        "Negro"
      ],
      [
        "Título",
        "Limpio*"
      ],
      [
        "Propietarios",
        "2*"
      ],
      [
        "Ubicación",
        "Tampa, FL 33602"
      ],
      [
        "Préstamo pendiente",
        "No confirmado"
      ]
    ],
    "description": "Conoce este Subaru Impreza y revisa sus fotografías originales.",
    "photos": [
      {
        "src": "/vehicles/subaru-impreza-2016/portada.webp",
        "caption": "Portada · fondo de presentación editado"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/diagonal-1.webp",
        "caption": "Vista delantera diagonal original"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/frente.webp",
        "caption": "Vista frontal"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/diagonal-2.webp",
        "caption": "Vista delantera opuesta"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/lateral.webp",
        "caption": "Vista lateral"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/trasera.webp",
        "caption": "Vista trasera"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/interior.webp",
        "caption": "Asientos delanteros"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/volante.webp",
        "caption": "Volante y transmisión"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/asientos.webp",
        "caption": "Asientos traseros"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/tablero.webp",
        "caption": "Tablero y consola"
      },
      {
        "src": "/vehicles/subaru-impreza-2016/puerta.webp",
        "caption": "Panel de la puerta"
      }
    ]
  }
];
