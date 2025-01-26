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

        #define TWOPI 6.28318530718

        uniform vec2 iResolution;
        uniform float iTime;
        varying vec2 vUv;

        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x) {
          return mod289(((x * 34.0) + 10.0) * x);
        }

        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = vec3(1.0) - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = vec4(1.0) - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;

          return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec3 c;
          float l, z = iTime;

          vec2 uv0 = fragCoord.xy / iResolution.xy;

          float noiseStrength = 0.16;
          float noiseScale = 0.001;
          float speed = 0.1;
          float noiseTime = iTime * speed;

          float noise = snoise(vec3(
            (fragCoord.x - iResolution.x / 2.0) * noiseScale,
            (fragCoord.y - iResolution.y / 2.0) * noiseScale,
            noiseTime
          ));

          uv0.x = fract(uv0).x + noiseStrength * sin(noise * TWOPI);
          uv0.y = fract(uv0).y + noiseStrength * cos(noise * TWOPI);

          for (int i = 0; i < 3; i++) {
            vec2 uv, p = uv0;
            uv = p;
            p -= 0.5;
            p.x *= iResolution.x / iResolution.y;
            z += 0.03;
            l = length(p);
            uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));
            c[i] = 0.05 / length(mod(uv, 1.0) - 0.5);
          }

          fragColor = vec4(c / l, 1.0);
        }

        void main() {
          mainImage(gl_FragColor, vUv * iResolution);
        }
        `,
  });
};

const Text2 = ({ position }) => {
  const shaderMaterial = useRef(createShaderMaterial());
  const groupRef = useRef();
  const textRef = useRef();

  useFrame(({ clock }) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uniforms.iTime.value = clock.getElapsedTime();
    }
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      const angle = Math.sin(time / 2) * (Math.PI / 6); // Max rotation is ±45 degrees
      groupRef.current.rotation.y = angle; // Apply the calculated angle
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
      <Text3D ref={textRef} font="/font/px.json" size={0.2} height={0.05}>
        <primitive attach="material" object={shaderMaterial.current} />
        BRING
      </Text3D>
    </group>
  );
};

export default Text2;
