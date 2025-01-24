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
  
        const float PI = 3.1415926535897932384626433832795;
  
        uniform vec2 iResolution;
        uniform float iTime;
  
        vec3 random3(vec3 c) {
          float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
          vec3 r;
          r.z = fract(512.0 * j);
          j *= 0.125;
          r.x = fract(512.0 * j);
          j *= 0.125;
          r.y = fract(512.0 * j);
          return r - 0.5;
        }
  
        const float F3 = 0.3333333;
        const float G3 = 0.1666667;
  
        float simplex3d(vec3 p) {
          vec3 s = floor(p + dot(p, vec3(F3)));
          vec3 x = p - s + dot(s, vec3(G3));
  
          vec3 e = step(vec3(0.0), x - x.yzx);
          vec3 i1 = e * (1.0 - e.zxy);
          vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  
          vec3 x1 = x - i1 + G3;
          vec3 x2 = x - i2 + 2.0 * G3;
          vec3 x3 = x - 1.0 + 3.0 * G3;
  
          vec4 w, d;
  
          w.x = dot(x, x);
          w.y = dot(x1, x1);
          w.z = dot(x2, x2);
          w.w = dot(x3, x3);
  
          w = max(0.6 - w, 0.0);
  
          d.x = dot(random3(s), x);
          d.y = dot(random3(s + i1), x1);
          d.z = dot(random3(s + i2), x2);
          d.w = dot(random3(s + 1.0), x3);
  
          w *= w;
          w *= w;
          d *= w;
  
          return dot(d, vec4(52.0));
        }
  
        float transformValue(float v) {
          v = 0.5 + 0.5 * v;
          v = pow(v + 0.35, 7.0);
          return v;
        }
  
        vec3 rgb2hsb(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
  
        vec3 hsb2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          rgb = rgb * rgb * (3.0 - 2.0 * rgb);
          return c.z * mix(vec3(1.0), rgb, c.y);
        }
  
        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 p = fragCoord.xy / iResolution.x;
          float offset = 0.9 * simplex3d(vec3(9.0 * p + vec2(0.0, -0.3 * iTime), 0.2 * iTime));
          float scl = 5.0;
          float value = simplex3d(vec3(iTime - offset, scl * p.x, scl * p.y));
          float value2 = simplex3d(vec3(1.1 * iTime - offset, scl * p.x, scl * p.y));
          float value3 = simplex3d(vec3(1.5 * iTime - offset, scl * p.x, scl * p.y));
  
          value = transformValue(value);
          value2 = transformValue(value2);
          value3 = transformValue(value3);
  
          vec3 color0 = vec3(value + value2, value2, value3 + value);
          vec3 rgb = clamp(color0, 0.0, 1.0);
  
          vec3 hsb = rgb2hsb(rgb);
          hsb.x += 0.3 * sin(13.0 * length(p - vec2(0.5, 0.25)) - 1.0 * iTime) + 0.15 * iTime;
          hsb.x = mix(hsb.x, 0.5, 0.7);
          hsb.y += 0.2 * sin(14.0 * length(p - vec2(0.5, 0.25)) - 1.1 * iTime + 0.5) - 0.4;
  
          rgb = hsb2rgb(hsb);
  
          fragColor = vec4(rgb, 1.0);
        }
  
        void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
        }
      `,
  });
};

const Text3 = ({ position }) => {
  const shaderMaterial = useRef(createShaderMaterial());
  const groupRef = useRef();
  const textRef = useRef();

  useFrame(({ clock }) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uniforms.iTime.value = clock.getElapsedTime();
    }
    if (groupRef.current) {
      groupRef.current.rotation.x -= 0.01;
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
      <Text3D ref={textRef} font="/font/caps.json" size={0.3} height={0.05}>
        <primitive attach="material" object={shaderMaterial.current} />
        BRING
      </Text3D>
    </group>
  );
};

export default Text3;
