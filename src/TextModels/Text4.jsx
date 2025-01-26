import { useRef, useEffect } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

// Extend ShaderMaterial for JSX compatibility
const createShaderMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      iTime: { value: 0 },
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
  
          uniform vec2 iResolution;
          uniform float iTime;
          varying vec2 vUv;
  
          float noise(vec2 p) {
            return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(iTime / 11.0))) + 0.2; 
          }
  
          mat2 rotate(float angle) {
            return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          }
  
          float fbm(vec2 p) {
            p *= 1.1;
            float f = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 3; i++) {
              mat2 modify = rotate(iTime / 50.0 * float(i * i));
              f += amp * noise(p);
              p = modify * p;
              p *= 2.0;
              amp /= 2.2;
            }
            return f;
          }
  
          float pattern(vec2 p, out vec2 q, out vec2 r) {
            q = vec2(fbm(p + vec2(1.0)), fbm(rotate(0.1 * iTime) * p + vec2(1.0)));
            r = vec2(fbm(rotate(0.1) * q + vec2(0.0)), fbm(q + vec2(0.0)));
            return fbm(p + 1.0 * r);
          }
  
          float digit(vec2 p) {
            vec2 grid = vec2(3.0, 1.0) * 15.0;
            vec2 s = floor(p * grid) / grid;
            p = p * grid;
            vec2 q;
            vec2 r;
            float intensity = pattern(s / 10.0, q, r) * 1.3 - 0.03;
            p = fract(p);
            p *= vec2(1.2, 1.2);
            float x = fract(p.x * 5.0);
            float y = fract((1.0 - p.y) * 5.0);
            int i = int(floor((1.0 - p.y) * 5.0));
            int j = int(floor(p.x * 5.0));
            int n = (i - 2) * (i - 2) + (j - 2) * (j - 2);
            float f = float(n) / 16.0;
            float isOn = intensity - f > 0.1 ? 1.0 : 0.0;
            return p.x <= 1.0 && p.y <= 1.0 ? isOn * (0.2 + y * 4.0 / 5.0) * (0.75 + x / 4.0) : 0.0;
          }
  
          float displace(vec2 look) {
            float y = (look.y - mod(iTime / 4.0, 1.0));
            float window = 1.0 / (1.0 + 50.0 * y * y);
            return sin(look.y * 20.0 + iTime) / 80.0 * window;
          }
  
          vec3 getColor(vec2 p) {
            float bar = mod(p.y + iTime * 20.0, 1.0) < 0.2 ? 1.4 : 1.0;
            p.x += displace(p);
            float middle = digit(p);
            float off = 1.0;
            float sum = 0.0;
            for (float i = -1.0; i < 2.0; i += 1.0) {
              for (float j = -1.0; j < 2.0; j += 1.0) {
                sum += digit(p + vec2(off * i, off * j));
              }
            }
            // Set blue color with intensity
            return mix(vec3(1.0), vec3(0.0, 82.0 / 255.0, 1.0), middle + sum / 10.0 * bar);

          }
  
          void main() {
            vec2 fragCoord = vUv * iResolution;
            vec2 p = fragCoord / iResolution;
            vec3 col = getColor(p);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
  });
};

const Text4 = ({ position }) => {
  const shaderMaterial = useRef(createShaderMaterial());
  const groupRef = useRef();
  const textRef = useRef();

  useFrame(({ clock }) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uniforms.iTime.value = clock.getElapsedTime();
    }
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01;
    }
  });

  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current);
      const center = box.getCenter(new THREE.Vector3());
      textRef.current.position.set(-center.x, -center.y, -center.z);
    }
  }, []);

  return (
    <group ref={groupRef} position={position}>
      <Text3D ref={textRef} font="/font/super.json" size={0.3} height={0.05}>
        <primitive attach="material" object={shaderMaterial.current} />
        on
      </Text3D>
    </group>
  );
};

export default Text4;
