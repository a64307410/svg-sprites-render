// Generated by CoffeeScript 1.9.3
(function() {
  var init, inited,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!window) {
    throw new Error("For web browser only!!");
  }

  window.svgSprites = function() {
    var append_svg, isHTMLElement, load_stack, remove_load, render_svg, request, self, sprites;
    sprites = {};
    load_stack = [];
    self = this;
    request = function(opts) {
      var complete_callback, error_callback, req_async, req_password, req_timeout, req_url, req_user, success_callback, xmlhttp;
      if (!opts) {
        throw new Error("Request Options is required");
      }
      req_url = opts.url;
      req_async = opts.async || true;
      req_user = opts.user || '';
      req_password = opts.password || '';
      req_timeout = opts.timeout || 0;
      if (!req_url) {
        throw new Error("Request URL is required");
      }
      success_callback = opts.success;
      error_callback = opts.error;
      complete_callback = opts.complete;
      xmlhttp = new XMLHttpRequest();
      xmlhttp.timeout = req_timeout;
      xmlhttp.ontimeout = function() {
        return console.error("The request for " + req_url + " timed out.");
      };
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
          if (xmlhttp.status === 200) {
            if (typeof success_callback === 'function') {
              success_callback(xmlhttp.response, xmlhttp.status);
            }
          } else {
            if (typeof error_callback === 'function') {
              error_callback(xmlhttp.response, xmlhttp.status);
            }
          }
          if (typeof complete_callback === 'function') {
            complete_callback(xmlhttp.response, xmlhttp.status);
          }
        }
      };
      xmlhttp.open("GET", req_url, req_async, req_user, req_password);
      xmlhttp.setRequestHeader("Accept", "text/xml");
      return xmlhttp.send();
    };
    remove_load = function(str) {
      var idx;
      idx = load_stack.indexOf(str);
      if (idx > -1) {
        load_stack.splice(idx, 1);
      }
    };
    append_svg = function(data, name) {
      var child, err, fragment, i, len, ref, svg, svgs, view_box;
      fragment = document.createElement("div");
      fragment.innerHTML = data;
      svgs = fragment.querySelectorAll("[id]");
      sprites[name] = {};
      for (i = 0, len = svgs.length; i < len; i++) {
        svg = svgs[i];
        try {
          view_box = svg.getAttribute('viewBox');
          if (!view_box) {
            continue;
          }
          if (ref = svg.id, indexOf.call(sprites[name], ref) < 0) {
            sprites[name][svg.id] = {
              children: (function() {
                var j, len1, ref1, results;
                ref1 = svg.childNodes;
                results = [];
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  child = ref1[j];
                  if (child.nodeType === 1) {
                    results.push(child);
                  }
                }
                return results;
              })(),
              view: view_box
            };
          } else {
            throw new Error("SVG ID is duplicated!!");
          }
        } catch (_error) {
          err = _error;
          console.error(err);
        }
      }
    };
    isHTMLElement = function(o) {
      var is_obj, is_obj_type, result;
      is_obj = o && typeof o === 'object' && o !== null;
      is_obj_type = o.nodeType === 1 && typeof o.nodeName === 'string';
      result = is_obj && is_obj_type;
      return result;
    };
    render_svg = function(element) {
      var child, gp, group, i, id, j, len, len1, ref, svg, svg_elements, target, target_split;
      if (!element || !isHTMLElement(element)) {
        element = document;
      }
      if (element.nodeName.toUpperCase() === 'SVG' && element.getAttribute("svg-sprite")) {
        svg_elements = [element];
      } else {
        svg_elements = element.querySelectorAll("svg[svg-sprite]");
      }
      for (i = 0, len = svg_elements.length; i < len; i++) {
        svg = svg_elements[i];
        target = svg.getAttribute("svg-sprite");
        if (!target) {
          continue;
        }
        target_split = target.split(":");
        if (target_split.length < 2) {
          continue;
        }
        gp = target_split[0];
        id = target_split[1];
        group = sprites[gp];
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild);
        }
        if (id && group && group.hasOwnProperty(id)) {
          ref = group[id].children;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            child = ref[j];
            svg.appendChild(child.cloneNode(true));
          }
          svg.setAttribute('viewBox', group[id].view);
        } else {
          console.error("SVG Sprite '" + target + "' not found:");
          console.log(gp, id);
          console.log(sprites, group);
        }
      }
    };
    this.load = function(svg_url, svg_name) {
      if (!svg_name) {
        svg_name = svg_url.replace(/^.*[\\\/]/, '');
      }
      load_stack.push(svg_url);
      console.log("SVG Sprites load " + svg_url + " [" + svg_name + "]");
      request({
        type: 'GET',
        url: svg_url,
        success: function(data) {
          append_svg(data, svg_name);
          return remove_load(svg_url);
        },
        error: function(xhr, type) {
          console.error('Ajax error! ' + type, xhr);
          remove_load(svg_url);
        }
      });
    };
    this.render = function(element, timeout) {
      var timer;
      if (!timeout) {
        timeout = 30000;
      }
      timeout = new Date().getTime() + timeout;
      timer = setInterval(function() {
        var err;
        try {
          if (load_stack.length <= 0) {
            clearInterval(timer);
            render_svg(element);
          }
          if (new Date().getTime() > timeout) {
            clearInterval(timer);
            throw new Error("SVG Sprites render timeout!!");
          }
        } catch (_error) {
          err = _error;
          return console.error(err);
        }
      }, 100);
    };
    return this;
  };

  inited = false;

  init = function() {
    var group, i, len, spr, svgSet, svgURLs, url;
    if (inited) {
      return;
    }
    svgSet = new svgSprites();
    svgURLs = document.querySelectorAll('[svg-sprites-loader]');
    if (!svgURLs || svgURLs.length <= 0) {
      return;
    }
    for (i = 0, len = svgURLs.length; i < len; i++) {
      spr = svgURLs[i];
      url = spr.dataset.url;
      group = spr.dataset.name;
      if (typeof url === 'string' && typeof group === 'string') {
        svgSet.load(url, group);
      }
    }
    svgSet.render();
    return inited = true;
  };

  if (document.readyState === "complete" || document.readyState === "loaded") {
    init();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function() {
      document.removeEventListener('DOMContentLoaded', arguments.callee, false);
      return init();
    }, false);
  }

}).call(this);
