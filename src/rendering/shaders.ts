// Shader for hot pink triangle
export const triangleShader = `
  @group(0) @binding(0)
  var<uniform> modelMatrix: mat4x4<f32>;

  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
  };

  @vertex
  fn vs_main(@location(0) position: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = modelMatrix * vec4<f32>(position, 0.0, 1.0);
    return out;
  }

  @fragment
  fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.1, 0.6, 1.0); // hot pink
  }
`;

// Shader for glowing orb
export const orbGlowShader = `
  @group(0) @binding(0)
  var<uniform> modelMatrix: mat4x4<f32>;

  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) localPos: vec2<f32>
  };

  @vertex
  fn vs_main(@location(0) position: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = modelMatrix * vec4<f32>(position, 0.0, 1.0);
    out.localPos = position;
    return out;
  }

  @fragment
  fn fs_main(@location(0) localPos: vec2<f32>) -> @location(0) vec4<f32> {
    let dist = length(localPos);
    let glow = smoothstep(0.05, 0.0, dist);
    let core = smoothstep(0.015, 0.0, dist);
    let color = vec3<f32>(1.0, 0.8, 0.2);
    return vec4<f32>(color * (glow + core), glow);
  }
`;
