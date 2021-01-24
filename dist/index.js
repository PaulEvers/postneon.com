/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index/index.js":
/*!****************************!*\
  !*** ./src/index/index.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/babel-loader/lib/index.js):\\nSyntaxError: C:\\\\wamp64\\\\www\\\\postneon.com\\\\src\\\\index\\\\index.js: Unexpected token, expected \\\",\\\" (57:69)\\n\\n\\u001b[0m \\u001b[90m 55 | \\u001b[39m        \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_three \\u001b[33m=\\u001b[39m \\u001b[36mnew\\u001b[39m \\u001b[33mThreeManager\\u001b[39m({ app\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m })\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 56 | \\u001b[39m        \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_tween \\u001b[33m=\\u001b[39m \\u001b[36mnew\\u001b[39m \\u001b[33mTweenManager\\u001b[39m({ app\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m,\\u001b[39m _three\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_three })\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m\\u001b[31m\\u001b[1m>\\u001b[22m\\u001b[39m\\u001b[90m 57 | \\u001b[39m        \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_gui \\u001b[33m=\\u001b[39m \\u001b[36mnew\\u001b[39m \\u001b[33mGUIManager\\u001b[39m({ app\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m,\\u001b[39m _three\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_three }\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m    | \\u001b[39m                                                                     \\u001b[31m\\u001b[1m^\\u001b[22m\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 58 | \\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 59 | \\u001b[39m        \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_interaction \\u001b[33m=\\u001b[39m \\u001b[36mnew\\u001b[39m \\u001b[33mInteractionManager\\u001b[39m({ app\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m,\\u001b[39m _three\\u001b[33m:\\u001b[39m \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_three })\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 60 | \\u001b[39m        \\u001b[36mthis\\u001b[39m\\u001b[33m.\\u001b[39m_three\\u001b[33m.\\u001b[39minitLogos()\\u001b[33m.\\u001b[39mthen(() \\u001b[33m=>\\u001b[39m {\\u001b[0m\\n    at Parser._raise (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:748:17)\\n    at Parser.raiseWithData (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:741:17)\\n    at Parser.raise (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:735:17)\\n    at Parser.unexpected (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9101:16)\\n    at Parser.expect (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9087:28)\\n    at Parser.parseExprList (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11267:14)\\n    at Parser.parseNewArguments (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10858:25)\\n    at Parser.parseNew (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10852:10)\\n    at Parser.parseNewOrNewTarget (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10838:17)\\n    at Parser.parseExprAtom (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10506:21)\\n    at Parser.parseExprSubscripts (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10150:23)\\n    at Parser.parseUpdate (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10130:21)\\n    at Parser.parseMaybeUnary (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:10119:17)\\n    at Parser.parseExprOps (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9989:23)\\n    at Parser.parseMaybeConditional (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9963:23)\\n    at Parser.parseMaybeAssign (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9926:21)\\n    at Parser.parseMaybeAssign (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9950:25)\\n    at Parser.parseExpressionBase (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9871:23)\\n    at C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9865:39\\n    at Parser.allowInAnd (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11541:16)\\n    at Parser.parseExpression (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:9865:17)\\n    at Parser.parseStatementContent (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11807:23)\\n    at Parser.parseStatement (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11676:17)\\n    at Parser.parseBlockOrModuleBlockBody (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12258:25)\\n    at Parser.parseBlockBody (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12249:10)\\n    at Parser.parseBlock (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12233:10)\\n    at Parser.parseFunctionBody (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11221:24)\\n    at Parser.parseFunctionBodyAndFinish (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11205:10)\\n    at Parser.parseMethod (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:11155:10)\\n    at Parser.pushClassMethod (C:\\\\wamp64\\\\www\\\\postneon.com\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12701:30)\");\n\n//# sourceURL=webpack:///./src/index/index.js?");

/***/ })

/******/ });