// var reCssUrl = /.+\.css($|\?.*$)/i,
// 	reAbsoluteUrl = /^[a-z]*:\/\/.+/i;


// // region << Helpers >>
// /*function noop() {
// 	}*/

// function isArray(value: any) {
// 	return value instanceof Array;
// }

// /*function toArray(args) {
// 	return [].slice.call(args, 0);
// 	}*/

// function isCssUrl(path: string) {
// 	return reCssUrl.test(path);
// }

// // from Simon Lydell's https://github.com/lydell/resolve-url
// function resolveUrl(...parts: string[]): string {

// 	var numUrls = arguments.length;

// 	if (numUrls === 0) {
// 		throw new Error("resolveUrl requires at least one argument; got none.");
// 	}

// 	var base = document.createElement("base");
// 	base.href = arguments[0];

// 	if (numUrls === 1) {
// 		return base.href;
// 	}

// 	var head = document.getElementsByTagName("head")[0];
// 	head.insertBefore(base, head.firstChild);

// 	var a = document.createElement("a");
// 	var resolved: string;

// 	var index;
// 	for (index = 1; index < numUrls; index++) {
// 		a.href = arguments[index];
// 		resolved = a.href;
// 		base.href = resolved;
// 	}

// 	head.removeChild(base);

// 	return resolved;
// }

// function getNewId() {
// 	return String(Math.round(Math.random() * (999999 - 100000) + 100000));
// }
// // endregion << Helpers >>



// // Loader //////////////////////////////////////////////////////////////////////////////////////////////////////////
// var State = {
// 	REGISTERED: 'REGISTERED',
// 	LOADING: 'LOADING',
// 	LOADED: 'LOADED',
// 	CHECKED: 'CHECKED'
// };

// var TargetType = {
// 	STYLESHEET : 'STYLESHEET'
// };


// export class Loader {

// }

// /**
// 	*
// 	* @param [config]
// 	* @constructor
// 	*/
// var Loader = function(config) {

// 	this.paths = {};

// 	this._scripts = {};
// 	this._stylesheets = {};
// 	this._aliases = {};
// 	this._checkpoints = {};
// 	this._history = [];

// 	this.instruments = new Instruments(config);

// };

// Loader.prototype = {

// 	resolveUrl : resolveUrl,

// 	_translatePath : function(path) {

// 		var paths = this.paths || {};

// 		if (paths) {
// 			var aliasPath;
// 			for (aliasPath in paths) {
// 				if (paths.hasOwnProperty(aliasPath)) {
// 					if (path.indexOf(aliasPath) == 0) {
// 						path = path.replace(aliasPath, paths[aliasPath]);
// 						break;
// 					}
// 				}
// 			}
// 		}

// 		return path;

// 	},

// 	/**
// 		* @param {String} target
// 		* @return {Target}
// 		*/
// 	_resolveTarget : function(targetName) {

// 		var target = null,
// 			aux;

// 		// stylesheet
// 		if ((aux = this._getStylesheet(targetName) || (isCssUrl(targetName) && (aux = this._getStylesheet(resolveUrl(targetName)))))) {
// 			target = {
// 				type : TargetType.STYLESHEET,
// 				value : aux
// 			};
// 		}

// 		return target;
// 	},

// 	/**
// 		* @param {String} path
// 		* @return {Stylesheet}
// 		*/
// 	_registerStylesheet : function(path) {

// 		path = resolveUrl(path);

// 		var stylesheet = this._getStylesheet(path);

// 		if (!stylesheet) {
// 			stylesheet = this._stylesheets[path] = {
// 				path : path,
// 				state : State.REGISTERED,
// 				callbacks : []
// 			};
// 		}

// 		return stylesheet;

// 	},

// 	_getStylesheet : function(path) {

// 		path = resolveUrl(path);
// 		return this._stylesheets.hasOwnProperty(path) ? this._stylesheets[path] : null;

// 	},

// 	/**
// 		* @param {String|Array<String>} targets
// 		* @param {String} [alias]
// 		* @return {Array<Script>}
// 		*/
// 	_registerTargets : function(targets, alias) {

// 		var i,
// 			k,
// 			aux,
// 			target,
// 			resolvedTarget,
// 			result = null;

// 		// TODO validar/normalizar argumentos
// 		targets = isArray(targets) ? targets : [targets];

// 		for (i = 0; i < targets.length; i++) {
// 			target = targets[i];
// 			resolvedTarget = this._resolveTarget(target);

// 			// Alias ou checkpoints tem que ser registrados previamente.
// 			// Se não resolveu, tem que ser um script ou stylesheet, e ai o registramos.
// 			if (!resolvedTarget) {
// 				if (isCssUrl(target)) {
// 					resolvedTarget = {
// 						type : TargetType.STYLESHEET,
// 						value : this._registerStylesheet(this._translatePath(target))
// 					};
// 				}
// 				else {
// 					// TODO Permitir uso de checkpoints e aliases ainda não registrados
// 					throw new Error('Loader: The name "' + target + '" is not a registered alias or checkpoint and is not a valid script or stylesheet URL.');
// 				}
// 			}

// 			if (!result) {
// 				result = {
// 					scripts : [],
// 					stylesheets : [],
// 					checkpoints : []
// 				};
// 			}

// 			switch (resolvedTarget.type) {
// 				case TargetType.STYLESHEET:
// 					result.stylesheets.push(resolvedTarget.value);
// 					break;
// 			}
// 		}

// 		return result;
// 	},

// 	/**
// 		* @param {String|Array<String>} targets
// 		* @param {String|Function} [aliasOrCallback]
// 		* @param {Function} [callback]
// 		*/
// 	load : function(targets, aliasOrCallback, callback) {

// 		var alias,
// 			resolvedTargets,
// 			waiting,
// 			i,
// 			checkpoint;

// 		// 1 ou 2 argumentos
// 		if (callback == null) {
// 			if (typeof(aliasOrCallback) == 'function') {
// 				callback = aliasOrCallback;
// 			}
// 			else if (aliasOrCallback != null) {
// 				alias = aliasOrCallback;
// 			}
// 		}
// 		// 3 argumentos
// 		else {
// 			alias = aliasOrCallback;
// 		}

// 		resolvedTargets = this._registerTargets(targets, alias);

// 		var id = getNewId();
// 		this.instruments.log('[' + id + '] Loading targets: ' + targets + '...');

// 		waiting = resolvedTargets.scripts.length + resolvedTargets.stylesheets.length + resolvedTargets.checkpoints.length;

// 		var self = this;
// 		function _callback() {
// 			if (!--waiting) {
// 				self.instruments.log('[' + id + '] Loaded');
// 				callback();
// 			}
// 		}

// 		for (i = 0; i < resolvedTargets.stylesheets.length; i++) {
// 			this._loadStylesheet(resolvedTargets.stylesheets[i], callback ? _callback : null);
// 		}

// 		return this;

// 	},

// 	/**
// 		* @param {Stylesheet} stylesheet
// 		* @param {Function} [callback]
// 		*/
// 	_loadStylesheet : function(stylesheet, callback) {

// 		var self = this,
// 			requestInstrument;

// 		// Já foi carregado? Chama o callback, se for o caso
// 		if (stylesheet.state === State.LOADED) {
// 			//self.instruments.log('  Stylesheet ' + stylesheet.path + ' already loaded');
// 			callback && setTimeout(callback, 0);
// 		}
// 		else {
// 			// Registra o callback, se for o caso
// 			callback && stylesheet.callbacks.push(callback);

// 			// Se não tiver em processo de carregamento, passa a estar
// 			if (stylesheet.state === State.REGISTERED) {
// 				stylesheet.state = State.LOADING;

// 				//self.instruments.log('  Loading stylesheet ' + stylesheet.path + '...');
// 				requestInstrument = self.instruments.registerRequest(stylesheet.path);

// 				$stylesheet.get(stylesheet.path, function() {
// 					var _callback;

// 					//self.instruments.log('  Stylesheet ' + stylesheet.path + ' loaded');
// 					requestInstrument.setDone();

// 					stylesheet.state = State.LOADED;
// 					while (_callback = stylesheet.callbacks.shift()) {
// 						setTimeout(_callback, 0);
// 					}
// 				});
// 			}
// 		}

// 	}

// };

// var $stylesheet = {

// 	/**
// 		*
// 		* @param {string} stylesheetUrl
// 		* @param {function} [callback]
// 		*/
// 	get : function(stylesheetUrl, callback) {

// 		var head = document.getElementsByTagName('head')[0],
// 			link = document.createElement('link');

// 		link.type = "text/css";
// 		link.rel = "stylesheet";
// 		link.href = stylesheetUrl;

// 		// Android Browser 2.3.3 não notifica, então optamos por checar manualmente
// 		var docStyles = document.styleSheets;
// 		var cssnum = docStyles.length;
// 		var ti = setInterval(function() {
// 			//if (!loaded) {
// 			for (var i = cssnum; i < docStyles.length; i++) {
// 				if (!docStyles[i] || !docStyles[i].href || docStyles[i].href.indexOf(stylesheetUrl) == -1) {
// 					continue;
// 				}
// 				clearInterval(ti);
// 				//loaded = true;
// 				callback();
// 				break;
// 			}
// 			/*}
// 				else {
// 				clearInterval(ti);
// 				}*/
// 		}, 10);

// 		/*var loaded = false;
// 			link.onload = function() {
// 			if (!loaded) {
// 			console.log('1');
// 			loaded = true;
// 			callback();
// 			}
// 			};*/

// 		/*link.addEventListener('load', function() {
// 			if (!loaded) {
// 			loaded = true;
// 			callback();
// 			}
// 			}, false);*/

// 		/*link.onreadystatechange = function() {
// 			var state = link.readyState;
// 			if (state === 'loaded' || state === 'complete') {
// 			link.onreadystatechange = null;
// 			callback();
// 			}
// 			};*/

// 		head.appendChild(link);

// 	}
// };