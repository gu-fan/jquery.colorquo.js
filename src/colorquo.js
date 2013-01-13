/**
 * ColorQuo Color Picker 1.0
 *
 * Author: Rykka G.F.
 * Update: 2013-01-13
 *
 *
 * Modified from farbtastic  1.3u by © 2008 Steven Wittens
 *
 *       Add hex/rgb/hsl input
 *       Change hue selector to a bar to reduce size
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

(function ($) {
	var console = window.console ? window.console : {
			log: $.noop,
			error: function (msg) {
				$.error(msg);
			}
		},
    debug = true;

    var regHex = /^#?([a-f0-9]{6})$/i,
        regRGB = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i,
        regHSL = /^hsl\((\d{1,3}),(\d{1,3})%,(\d{1,3})%\)$/i,
        regSpc = /\s/g;

	$._colorquo = function (container, options) {
		var fb = this,
			defaults = {
				callback:		null,
				color:			"#808080",
				version:		1,
				width:			150
			},
			element, // $(div.colorquo)
			charMin = 70,
			image;


		fb.init = function () {
			// Parse options
			if (options && !options.callback) {
				options = { callback: options };
			}

			options = $.extend(true, defaults, options);
			// options.wheelWidth = options.width / 10;

			fb.options2 = options;
			
			// Touch support
			$.extend($.support, {
				touch: (typeof Touch === "object")
			});

			// Initialize
			fb.initWidget();

			// Install mousedown handler (the others are set on the document on-demand)
			element.find("*").bind("mousedown.colorquo", fb.mousedown);
			element.find(".q-show").off("mousedown.colorquo", fb.mousedown).on("click.colorquo", fb.changeInputType);
			element.find(".q-hex").off("mousedown.colorquo", fb.mousedown).on("mousedown.colorquo", fb.inputHex).on("keyup.colorquo",fb.keyDown);

			// Install touch handlers to simulate appropriate mouse events
			if ($.support.touch) {
				element.find("*")
					.bind("touchstart.colorquo touchmove.colorquo touchend.colorquo touchcancel.colorquo", $.colorquo.touchHandle);
			}

			// Set linked elements/callback
			if (options.callback) {
				$.colorquo.linkTo_(fb, options.callback);
			}
		};

		/**
		 * Initialize the color picker widget
		 */
		fb.initWidget = function () {
			// Insert markup
			$(container).html('<div class="colorquo">' +
				'<input class="q-hex"/>' +
				'<div class="q-show">#</div>' +
				'<div class="q-color"></div>' +
				'<div class="q-bar"></div>' +
				'<div class="h-marker q-indicator"></div>' +
				'<div class="sl-marker q-marker"></div>' +
				'</div>'
				);

			element = $(container).find(".colorquo");
			// Determine layout
			fb.radius = 84;
			fb.square = Math.floor(120 / 2);
			// the color box shifting pos [x,y]
			// fb.shift = [30,30];
			fb.mid = Math.floor(options.width / 2);
            // '<div class="wheel"></div>' +
			// fb.wheel = $(".wheel", container)[0];
            
            // 2: hex 3: rgb 4: hsl
			fb.inputType = 'hex';


			// Fix background PNGs in IE6
			if (navigator.appVersion.match(/MSIE [0-6]\./)) {
				element.find("*").each(function () {
					if (this.currentStyle.backgroundImage !== "none") {
						image = this.currentStyle.backgroundImage;
						image = this.currentStyle.backgroundImage.substring(5, image.length - 2);
						$(this).css({
							"backgroundImage": "none",
							"filter": "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
						});
					}
				});
			}

			fb.solidFill = element.find(".q-color");
		};

		/**
		 * Draw the selection markers.
		 */
		fb.drawMarkers = function () {
			// var angle = fb.hsl[0] * 6.28,
				// x1 =  Math.sin(angle) * fb.radius,
				// y1 = -Math.cos(angle) * fb.radius,
               var  hue = fb.hsl[0],
                x1 = -fb.square ,
                y1 = -(hue * fb.square * 2 - fb.square) + 15,
				x2 = 2 * fb.square * (0.5 - fb.hsl[1]) + 15,
				y2 = 2 * fb.square * (0.5 - fb.hsl[2]) + 15 ;

			element.find(".h-marker").css({
				left: Math.round(x1 + fb.mid ) + "px",
				top: Math.round(y1 + fb.mid ) + "px"
			});

			element.find(".sl-marker").css({
				left: Math.round(x2 + fb.mid ) + "px",
				top: Math.round(y2 + fb.mid ) + "px"
			});
		};

		/**
		 * Update the markers and styles
		 */
		fb.updateDisplay = function () {
			// Determine whether labels/markers should invert
			// :old: fb.invert = fb.hsl[2] <= 0.5;
			fb.invert = (fb.rgb[0] * 0.3 + fb.rgb[1] * 0.59 + fb.rgb[2] * 0.11) <= 0.6;

			// Update the solid background fill
			fb.solidFill.css("backgroundColor", $.colorquo.colorUtilities.pack($.colorquo.colorUtilities.HSLToRGB([fb.hsl[0], 1, 0.5])));

			// Draw markers
			fb.drawMarkers();
        
            // set hex value
            var h = element.find(".q-hex")
                    .removeClass('state-error'),
                s = element.find('.q-show');
            switch (fb.inputType) {
                case 'rgb':
                    h.val('rgb('+ Math.round(fb.rgb[0]*255)+','+
                                Math.round(fb.rgb[1]*255)+','+
                                Math.round(fb.rgb[2]*255)+ ')');
                    s.text('R');
                    break;
                case 'hsl':
                    h.val('hsl('+ Math.round(fb.hsl[0]*360)+','+
                                Math.round(fb.hsl[1]*100)+'%,'+
                                Math.round(fb.hsl[2]*100)+ '%)');
                    s.text('H');
                    break;
                case 'hex':
                default:
                    s.text('#');
                    h.val(fb.color.toUpperCase());
                    break;

            }
                

			// Linked elements or callback
			if (typeof fb.callback === "object") {
				// Set background/foreground color
				$(fb.callback).css({
					backgroundColor: fb.color,
					color: fb.invert ? "#fff" : "#000"
				});

				// Change linked value
				$(fb.callback).each(function () {
					if ((typeof this.value === "string") && this.value !== fb.color) {
						this.value = fb.color;
					}
				});
			} else if (typeof fb.callback === "function") {
				fb.callback.call(fb, fb.color);
			}
		};
		
		fb.changeInputType = function(event) { 
            var s = element.find('.q-show')
            switch (s.text()) {
                case '#':
                    fb.inputType = 'rgb';
                    break;
                case 'R':
                    fb.inputType = 'hsl';
                    break;
                case 'H':
                default:
                    fb.inputType = '#hex';
                    break;
            }
            fb.updateDisplay();
		};
		/**
		 * Validate color RGB/HLS/HEX
		 */
        fb.validateColor = function(color) { 
            color = color.replace(regSpc, '');
            var m =  regHex.exec(color);
            if (m != null ) {
                fb.inputType = 'hex';
                return '#' + m[1];
            }
            m =  regRGB.exec(color);
            if (m != null ) {
                var r = parseInt(m[1],10), 
                    g = parseInt(m[2],10), 
                    b = parseInt(m[3],10); 
                if ( r<255 && r >= 0 && g < 255 && g >= 0 && b < 255 && b>= 0 ) { 
                    fb.inputType = 'rgb';
                    return $.colorquo.colorUtilities.pack([r/255,g/255,b/255]);
                }
            }
            m = regHSL.exec(color);
            if (m != null ) {
                var h = parseInt(m[1],10), 
                    s = parseInt(m[2],10), 
                    l = parseInt(m[3],10); 
                if ( h<=360 && h >= 0 && s <= 100 && s >= 0 && l <= 100 && l>= 0 ) { 
                    fb.inputType = 'hsl';
                    return $.colorquo.colorUtilities.pack($.colorquo.colorUtilities.HSLToRGB([h/360,s/100,l/100]));
                }
            }
            return false;
        };
		/**
		 * Hex input handler
		 */
		fb.inputHex = function (event) {
            // $.colorquo.dragging = false;
            // event.preventDefault();
            // return true;
		};

		/* input key event */
		fb.keyDown = function (event) {
            var pressedKey = event.charCode || event.keyCode || -1;
            if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
                event.preventDefault();
                return false;
            }

            fb.inputChange.apply(this);
		};
		/* Hex input change handler */
		fb.inputChange = function (event) {
		    // check if color value valid.
		    // and return the hex value
            // c = regHex.exec(this.value);
            c = fb.validateColor(this.value);
            if ( c != false ) {
                $.colorquo.setColor(fb, c);
                $(this).removeClass('state-error');
            } else {
                $(this).addClass('state-error');
            }
		};
		/**
		 * Mousedown handler
		 */
		fb.mousedown = function (event) {
			// Capture mouse
			if (!$.colorquo.dragging) {
				$(document).bind("mousemove.colorquo", fb.mousemove).bind("mouseup.colorquo", $.colorquo.mouseup);
				$.colorquo.dragging = true;
			}

			// Update the stored offset for the widget
			fb.offset = element.offset();
//			fb.offset = $(fb.wheel).offset();

			// Check which area is being dragged
			var pos = $.colorquo.widgetCoords(fb, event);

            // When the drag x < -75+30-5 
            // from the instance middle.
			fb.HueDrag = pos.x < -50;

			// Process
			fb.mousemove(event);
			return false;
		};

		/**
		 * Mousemove handler
		 */
		fb.mousemove = function (event) {
			// Get coordinates relative to color picker center
			var pos = $.colorquo.widgetCoords(fb, event), hue, sat, lum;

			if (!fb.hsl) {
				return false;
			}

            // console.log(pos);
			// Set new HSL parameters
			if (fb.HueDrag) {
				// hue = Math.atan2(pos.x, -pos.y) / 6.28;
				// pos.y -45~75  hue 0~1
				// (1 - hue) cause hue increase from bot
				hue = 1 - ((pos.y - 15) / fb.square + 1) / 2 ;

				if (hue < 0) { hue = 0; }
				if (hue > 1) { hue = 1; }
				// if (hue < 0) { hue = hue % 1 + 1; }
				// if (hue > 1) { hue %= 1; }
				$.colorquo.setHsl(fb, [hue, fb.hsl[1], fb.hsl[2]]);
			} else {
				sat = Math.max(0, Math.min(1, -((pos.x-17)/ fb.square / 2) + 0.5));
				lum = Math.max(0, Math.min(1, -((pos.y-17)/ fb.square / 2) + 0.5));
				$.colorquo.setHsl(fb, [fb.hsl[0], sat, lum]);
			}

			return false;
		};


		fb.init();
	};

	$.colorquo = {
		dragging: false,

		messages: {
			noObject: "Something goes wrong, check object"
		},

		init: function (object, options) {
			var firstObject = null;

			return object.each(function () {
				// only first object used
				if (firstObject) {
					return;
				}

				firstObject = $(object[0]);

				if (!object.data("colorquo")) {
					object.data("colorquo", new $._colorquo(object, options));
				}
			});
		},

		mouseup: function () {
			// Uncapture mouse
			$(document).unbind(".colorquo");
			$.colorquo.dragging = false;
		},

		/**
		 * Change color with HTML syntax #123456
		 */
		setColor: function (fbInstance, color) {
			var unpack = $.colorquo.colorUtilities.unpack(color, fbInstance.options2.color);
			// alert([fbInstance.color, color]);

			if (fbInstance.color !== color && unpack) {
				fbInstance.color = color;
				fbInstance.rgb = unpack;
				fbInstance.hsl = $.colorquo.colorUtilities.RGBToHSL(fbInstance.rgb);
				fbInstance.updateDisplay();
			}

			return this;
		},

		/**
		 * Change color with HSL triplet [0..1, 0..1, 0..1]
		 */
		setHsl: function (fbInstance, hsl) {
			fbInstance.hsl = hsl;
			fbInstance.rgb = $.colorquo.colorUtilities.HSLToRGB(hsl);
			fbInstance.color = $.colorquo.colorUtilities.pack(fbInstance.rgb);
			fbInstance.updateDisplay();

			return this;
		},

		updateValue: function (fbInstance, linkedTo, event) {
			if (linkedTo.value && linkedTo.value !== fbInstance.color) {
				$.colorquo.setColor(fbInstance, linkedTo.value);
			}
		},

		/**
		 * Helper for returning coordinates relative to the center
		 */
		widgetCoords: function (fbInstance, event) {
			return {
				x: event.pageX - fbInstance.offset.left - fbInstance.mid,
				y: event.pageY - fbInstance.offset.top - fbInstance.mid
			};
		},

		/**
		 * Link to the given element(s) or callback
		 * 
		 * @private
		 */
		linkTo_: function (fbInstance, callback) {
			// Unbind previous nodes
			if (typeof fbInstance.callback === "object") {
				$(fbInstance.callback).unbind("keyup.colorquo", function (event) {
					$.colorquo.updateValue(fbInstance, this, event);
				});
			}

			// Reset color
			fbInstance.color = null;

			// Bind callback or elements
			if (typeof callback === "function") {
				fbInstance.callback = callback;
			} else if (typeof callback === "object" || typeof callback === "string") {
				fbInstance.callback = $(callback);
				fbInstance.callback.bind("keyup.colorquo", function (event) {
					$.colorquo.updateValue(fbInstance, this, event);
				});

				if (fbInstance.callback[0].value) {
					$.colorquo.setColor(fbInstance, fbInstance.callback[0].value);
				} else {
					$.colorquo.setColor(fbInstance, fbInstance.options2.color);
				}
			} else {
				fbInstance.callback = null;
			}

			return this;
		},

		/**
		 * jQuery layer
		 */
		linkTo: function (object, callback) {
			var firstObject = null;

			return object.each(function () {
				// only first object used
				if (firstObject) {
					return;
				}

				firstObject = $(object[0]);

				if (object.data("colorquo")) {
					$.colorquo.linkTo_(object.data("colorquo"), callback);
				}
			});
		},

		/**
		 * Simulate mouse events for touch devices
		 */
		touchHandle: function (event) {
			var touches = event.originalEvent.changedTouches,
				firstTouch = touches[0],
				type = "",
				simulatedEvent;

			switch (event.type) {
				case "touchstart":
					type = "mousedown";
					break;
				case "touchmove":
					type = "mousemove";
					break;
				case "touchend":
					type = "mouseup";
					break;
				default:
					return false;
			}

			// initMouseEvent(
			//     type, canBubble, cancelable, view, clickCount, 
			//     screenX, screenY, clientX, clientY, ctrlKey, 
			//     altKey, shiftKey, metaKey, button, relatedTarget
			// );
			simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(
				type, true, true, window, 1, 
				firstTouch.screenX, firstTouch.screenY, 
				firstTouch.clientX, firstTouch.clientY, false, 
				false, false, false, 0 /*left*/, null
			);

			firstTouch.target.dispatchEvent(simulatedEvent);
			event.preventDefault();
		},

		/* Various color utility functions */
		colorUtilities: {
			defaults: {
				color: "#000000"
			},

			dec2hex: function (x) {
				return (x < 16 ? "0" : "") + x.toString(16);
			},

			packDX: function (c, a) {
				return "#" + this.dec2hex(a) + this.dec2hex(c) + this.dec2hex(c) + this.dec2hex(c);
			},

			pack: function (rgb) {
				var r = Math.round(rgb[0] * 255),
					g = Math.round(rgb[1] * 255),
					b = Math.round(rgb[2] * 255);

				return "#" + this.dec2hex(r) + this.dec2hex(g) + this.dec2hex(b);
			},

			unpack: function (color, defaultColor) {
				function longForm(color, i) {
					return parseInt(color.substring(i, i + 2), 16) / 255;
				}

				function shortForm(color, i) {
					return parseInt(color.substring(i, i + 1), 16) / 15;
				}
				
				if (color.length === 7) {
					return [ longForm(color, 1), longForm(color, 3), longForm(color, 5) ];
				} else if (color.length === 4) {
					return [ shortForm(color, 1), shortForm(color, 2), shortForm(color, 3) ];
				}

				if (!defaultColor) {
					defaultColor = this.defaults.color;
				}

				return [ longForm(defaultColor, 1), longForm(defaultColor, 3), longForm(defaultColor, 5) ];
			},

			HSLToRGB: function (hsl) {
				var m1, m2, r, g, b,
					h = hsl[0], s = hsl[1], l = hsl[2];

				m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
				m1 = l * 2 - m2;
				return [
					this.hueToRGB(m1, m2, h + 0.33333),
					this.hueToRGB(m1, m2, h),
					this.hueToRGB(m1, m2, h - 0.33333)
				];
			},

			hueToRGB: function (m1, m2, h) {
//				h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
				h = (h + 1) % 1;

				if (h * 6 < 1) {
					return m1 + (m2 - m1) * h * 6;
				}
				if (h * 2 < 1) {
					return m2;
				}
				if (h * 3 < 2) {
					return m1 + (m2 - m1) * (0.66666 - h) * 6;
				}
				return m1;
			},

			RGBToHSL: function (rgb) {
				var r = rgb[0], g = rgb[1], b = rgb[2],
					min = Math.min(r, g, b),
					max = Math.max(r, g, b),
					delta = max - min,
					h = 0,
					s = 0,
					l = (min + max) / 2;

				if (l > 0 && l < 1) {
					s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
				}

				if (delta > 0) {
					if (max === r && max !== g) {
						h += (g - b) / delta;
					}
					if (max === g && max !== b) {
						h += (2 + (b - r) / delta);
					}
					if (max === b && max !== r) {
						h += (4 + (r - g) / delta);
					}
					h /= 6;
				}

				return [h, s, l];
			}
		},

		plugin: {
			exists: function () {
				return false;
			}
		}
	};

	$.fn.colorquo = function (method) {
		var args = arguments, plugin;

		if ("undefined" !== typeof $.colorquo[method]) {
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.colorquo[method].apply($.colorquo, Array.prototype.slice.call(args, 1));
		} else if ("object" === typeof method || !method) {
			Array.prototype.unshift.call(args, this);
			return $.colorquo.init.apply($.colorquo, args);
		} else if ($.colorquo.plugin.exists(method)) {
			plugin = $.colorquo.plugin.parseName(method);
			args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
			return $.colorquo[plugin.name][plugin.method].apply($.colorquo[plugin.name], Array.prototype.slice.call(args, 1));
		} else {
			console.error("Method '" +  method + "' does not exist on jQuery.colorquo.\nTry to include some extra controls or plugins");
		}
	};
})(jQuery);
