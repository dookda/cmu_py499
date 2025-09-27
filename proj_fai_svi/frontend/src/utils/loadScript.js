// src/utils/loadScript.js
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    // ป้องกันโหลดซ้ำ
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      console.log(`✅ Loaded script: ${src}`);
      resolve();
    };
    script.onerror = () => reject(new Error(`❌ Failed to load ${src}`));
    document.body.appendChild(script);
  });
}
