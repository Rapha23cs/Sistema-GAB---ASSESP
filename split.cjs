const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/raphael.sa/Desktop/sistemagab', 'src');
fs.mkdirSync(path.join(srcDir, 'components'), { recursive: true });
fs.mkdirSync(path.join(srcDir, 'data'), { recursive: true });
fs.mkdirSync(path.join(srcDir, 'pages'), { recursive: true });

const appJsxPath = path.join(srcDir, 'App.jsx');
const content = fs.readFileSync(appJsxPath, 'utf8');

const iconsMatch = content.match(/const Icons = \{[\s\S]*?\n\};\n/);
const iconsCode = iconsMatch[0];

const dataCode = content.substring(content.indexOf('const DUMMY_ORDERS'), content.indexOf('/* --- BADGE COMPONENTS --- */')).trim();

const badgesCode = content.substring(content.indexOf('const TypeBadge ='), content.indexOf('/* --- VIEWS --- */')).trim();

const ordersViewCode = content.substring(content.indexOf('const OrdersView ='), content.indexOf('const EquipmentsView =')).trim();

const equipmentsViewCode = content.substring(content.indexOf('const EquipmentsView ='), content.indexOf('const ContratosView =')).trim();

const contratosViewCode = content.substring(content.indexOf('const ContratosView ='), content.indexOf('/* --- MAIN APP --- */')).trim();

const mainAppCode = content.substring(content.indexOf('/* --- MAIN APP --- */'));
const errorBoundaryCode = content.substring(content.indexOf('class ErrorBoundary'), content.indexOf('const Icons =')).trim();

fs.writeFileSync(path.join(srcDir, 'components', 'Icons.jsx'), 
  "import React from 'react';\n\nexport " + iconsCode);

fs.writeFileSync(path.join(srcDir, 'data', 'mockData.js'), 
  dataCode.replace(/const DUMMY/g, 'export const DUMMY'));

fs.writeFileSync(path.join(srcDir, 'components', 'Badges.jsx'), 
  "import React from 'react';\nimport { Icons } from './Icons';\n\n" + badgesCode.replace(/const /g, 'export const '));

fs.writeFileSync(path.join(srcDir, 'pages', 'OrdersView.jsx'), 
  "import React, { useState } from 'react';\nimport { Icons } from '../components/Icons';\nimport { TypeBadge, StatusBadge } from '../components/Badges';\nimport { DUMMY_ORDERS } from '../data/mockData';\n\nexport " + ordersViewCode);

fs.writeFileSync(path.join(srcDir, 'pages', 'EquipmentsView.jsx'), 
  "import React from 'react';\nimport { Icons } from '../components/Icons';\nimport { ContractBadge, EqStatusBadge } from '../components/Badges';\nimport { DUMMY_EQUIPMENTS } from '../data/mockData';\n\nexport " + equipmentsViewCode);

fs.writeFileSync(path.join(srcDir, 'pages', 'ContratosView.jsx'), 
  "import React, { useState } from 'react';\nimport { Icons } from '../components/Icons';\nimport { DUMMY_CONTRACTS } from '../data/mockData';\n\nexport " + contratosViewCode);

const newAppJsx = "import React, { useState, Component } from 'react';\n" +
  "import { Icons } from './components/Icons';\n" +
  "import { OrdersView } from './pages/OrdersView';\n" +
  "import { EquipmentsView } from './pages/EquipmentsView';\n" +
  "import { ContratosView } from './pages/ContratosView';\n\n" +
  errorBoundaryCode + "\n\n" +
  mainAppCode;

fs.writeFileSync(appJsxPath, newAppJsx);
console.log('Successfully split files');
