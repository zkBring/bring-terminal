import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

const createShaderMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      iTime: { value: 0 },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;

      #define TAU 6.28318530718

      uniform vec2 iResolution;
      uniform float iTime;
      varying vec2 vUv;

      // Smooth noise function
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0);
        vec4 p = mod(((i.z + vec4(0.0, i1.z, i2.z, 1.0)) * 34.0 + 10.0) * i.z, 289.0);
        vec4 x_ = floor(p * 0.142857142857);
        vec4 y_ = floor(p - 7.0 * x_);
        vec4 x = x_ * 0.142857142857 - 0.5;
        vec4 y = y_ * 0.142857142857 - 0.5;
        vec4 h = vec4(1.0) - abs(x) - abs(y);

        vec3 p0 = vec3(x.xy, h.x);
        vec3 p1 = vec3(x.zw, h.y);
        vec3 p2 = vec3(y.xy, h.z);
        vec3 p3 = vec3(y.zw, h.w);

        vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      float character(int n, vec2 p) {
        p = floor(p * vec2(-4.0, 4.0) + 2.5);
        if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y) {
          int a = int(round(p.x) + 5.0 * round(p.y));
          return float((n >> a) & 1);
        }
        return 0.0;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 pix = fragCoord.xy - iResolution.xy * 0.5; // Center alignment
        pix /= 8.0; // Scale ASCII appearance
        vec3 col = vec3(0.0);

        // Generate smooth noise for character switching
        float noise = snoise(vec3(pix * 0.05, iTime * 0.5)); // Slower switching
        int n = 0;
        if (noise > -0.2) n = 8521864;   // Example ASCII values
        if (noise > 0.0) n = 17318430;
        if (noise > 0.2) n = 14815374;
        if (noise > 0.4) n = 15255086;

        vec2 p = mod(pix, 2.0) - vec2(1.0);
        col = vec3(character(n, p));

        // Apply blue or white coloring
        vec3 finalColor = col.x > 0.5 ? vec3(1.0) : vec3(0.0, 82.0 / 255.0, 1.0); // White or Blue
        fragColor = vec4(finalColor, 1.0);
      }

      void main() {
        mainImage(gl_FragColor, vUv * iResolution);
      }
    `,
  });
};

const Text = ({ position }) => {
  const shaderMaterial = useRef(createShaderMaterial());
  const groupRef = useRef();
  const textRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const { camera, raycaster, gl } = useThree();

  useFrame(({ clock }) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uniforms.iTime.value = clock.getElapsedTime();
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current);
      const center = box.getCenter(new THREE.Vector3());
      textRef.current.position.set(-center.x, -center.y, -center.z);
    }
  }, []);

  const getWorldPoint = (event) => {
    const pointer = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Plane facing camera
    const worldPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, worldPoint);
    return worldPoint;
  };

  // Handle drag start
  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsDragging(true);

    const worldPoint = getWorldPoint(event);
    dragOffset.current.copy(worldPoint).sub(groupRef.current.position);
  };

  // Handle drag movement
  const handlePointerMove = (event) => {
    if (!isDragging) return;

    event.stopPropagation();

    const worldPoint = getWorldPoint(event);
    const newPosition = worldPoint.sub(dragOffset.current);
    groupRef.current.position.copy(newPosition);
  };

  // Handle drag end
  const handlePointerUp = (event) => {
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}>
      <Text3D ref={textRef} font="/font/mc.json" size={0.3} height={0.05}>
        <primitive attach="material" object={shaderMaterial.current} />
        BRING
      </Text3D>
    </group>
  );
};

export default Text;
