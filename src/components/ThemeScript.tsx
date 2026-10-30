'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}

              // Prevent third-party browser extensions (e.g. Urban VPN "reading 'M_ID'")
              // from triggering Next.js dev error modal overlays
              try {
                var isExtensionError = function(msg, src, err) {
                  var str = (msg || '') + ' ' + (src || '') + ' ' + (err && err.stack ? err.stack : '');
                  return str.indexOf('chrome-extension://') !== -1 ||
                         str.indexOf('moz-extension://') !== -1 ||
                         str.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
                         str.indexOf("reading 'M_ID'") !== -1 ||
                         str.indexOf('M_ID') !== -1;
                };

                window.addEventListener('error', function(ev) {
                  if (isExtensionError(ev.message, ev.filename, ev.error)) {
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(ev) {
                  var reason = ev.reason;
                  if (reason && isExtensionError(reason.message || reason, reason.fileName || '', reason)) {
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                    return true;
                  }
                }, true);
              } catch (e) {}

              try {
                if (typeof MutationObserver !== 'undefined') {
                  var clean = function(node) {
                    if (node && node.nodeType === 1) {
                      if (node.hasAttribute('bis_skin_checked')) {
                        node.removeAttribute('bis_skin_checked');
                      }
                      if (node.querySelectorAll) {
                        var list = node.querySelectorAll('[bis_skin_checked]');
                        for (var i = 0; i < list.length; i++) {
                          list[i].removeAttribute('bis_skin_checked');
                        }
                      }
                    }
                  };

                  clean(document.documentElement);

                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        m.target.removeAttribute('bis_skin_checked');
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          clean(m.addedNodes[j]);
                        }
                      }
                    }
                  });

                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked'],
                    childList: true,
                    subtree: true
                  });
                }
              } catch (e) {}
            })()
          `,
        }}
      />
    );
  });

  return null;
}

