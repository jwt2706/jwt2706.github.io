import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Galaxy() {
  const galaxyRef = useRef();

  useEffect(() => {
    // constants
    const PARTICLE_COUNT = 1000;
    const INIT_CAMERA_POS = 500;
    const currentGalaxy = galaxyRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    const mouse = new THREE.Vector2();
    const targetRotation = new THREE.Vector2();

    let targetZ = INIT_CAMERA_POS;
    let isMobile = window.innerWidth < 640;

    // init
    camera.position.z = INIT_CAMERA_POS;
    renderer.setSize(window.innerWidth, window.innerHeight);
    galaxyRef.current.appendChild(renderer.domElement);

    // generate stars
    const particlesData = new Float32Array(PARTICLE_COUNT * 3); // 3 for xyz coords

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesData[i * 3] = getRandomCoord(); // x
      particlesData[i * 3 + 1] = getRandomCoord(); // y
      particlesData[i * 3 + 2] = getRandomCoord(); // z
    }

    particles.setAttribute(
      "position",
      new THREE.BufferAttribute(particlesData, 3)
    );

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // mouse movement
    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener("mousemove", onMouseMove, false);

    // scroll movement
    function onScroll(event) {
      const delta = Math.sign(event.deltaY);
      const scrollPosition = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;

      // if we're at the top and scrolling up, or at the bottom and scrolling down, don't move the camera
      if (
        (scrollPosition === 0 && delta < 0) ||
        (scrollPosition === scrollHeight && delta > 0)
      ) {
        return;
      }

      const change = delta * 8;
      targetZ -= Math.max(-10, Math.min(10, change));
    }

    window.addEventListener("wheel", onScroll, false);

    // main
    function animate() {
      requestAnimationFrame(animate);

      // if the user is on a mobile device then auto-rotate
      if (isMobile) {
        targetRotation.x += 0.001;
        targetRotation.y += 0.001;
      } else {
        targetRotation.x = mouse.y * 0.2;
        targetRotation.y = mouse.x * 0.2;
      }

      particleSystem.rotation.x +=
        (targetRotation.x - particleSystem.rotation.x) * 0.05;
      particleSystem.rotation.y +=
        (targetRotation.y - particleSystem.rotation.y) * 0.05;

      // lerp camera position
      camera.position.z += (targetZ - camera.position.z) * 0.05;

      renderer.render(scene, camera);
    }
    animate();

    function getRandomCoord() {
      return Math.random() * 800 - 400;
    }

    // clean up when unmounting
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", onScroll);
      if (currentGalaxy) {
        currentGalaxy.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={galaxyRef} id="galaxy" />;
}
