/**
 * 中国古代建筑 3D 模型生成器
 * 将 Three.js 几何体直接序列化为 GLB 二进制格式
 * 输出到 public/models/
 * 
 * GLB 格式: https://www.khronos.org/blog/glb-file-format-specification
 */

import * as THREE from 'three'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

// ===== 路径配置 =====
const OUT_DIR = path.join(process.cwd(), 'public', 'models')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// ===== 材质颜色定义 =====
const MATERIALS = {
  red_wall:    { color: [0xBB, 0x22, 0x11], roughness: 0.65, metalness: 0.05 },
  yellow_glaze:{ color: [0xD4, 0xA0, 0x17], roughness: 0.35, metalness: 0.25 },
  wood:        { color: [0x8B, 0x69, 0x14], roughness: 0.70, metalness: 0.05 },
  dark_wood:   { color: [0x5A, 0x3D, 0x0E], roughness: 0.75, metalness: 0.02 },
  stone:       { color: [0x7A, 0x7A, 0x72], roughness: 0.85, metalness: 0.02 },
  light_stone: { color: [0x9A, 0x9A, 0x92], roughness: 0.80, metalness: 0.02 },
  white:       { color: [0xE8, 0xE4, 0xDC], roughness: 0.50, metalness: 0.05 },
  blue_glaze:  { color: [0x1A, 0x5B, 0x8A], roughness: 0.35, metalness: 0.30 },
  gold:        { color: [0xDA, 0xA5, 0x20], roughness: 0.15, metalness: 0.80 },
  cliff:       { color: [0x6A, 0x5A, 0x4A], roughness: 0.90, metalness: 0.02 },
  dark_stone:  { color: [0x3A, 0x3A, 0x35], roughness: 0.88, metalness: 0.02 },
  green_tree:  { color: [0x4A, 0x7A, 0x4A], roughness: 0.85, metalness: 0.02 },
  door:        { color: [0x4A, 0x2A, 0x0A], roughness: 0.80, metalness: 0.02 },
  cliff_detail:{ color: [0x5A, 0x4A, 0x3A], roughness: 0.92, metalness: 0.01 },
  roof_grey:   { color: [0x6A, 0x6A, 0x65], roughness: 0.50, metalness: 0.10 },
  bank:        { color: [0x6A, 0x7A, 0x62], roughness: 0.90, metalness: 0.02 },
  riverbed:    { color: [0x4A, 0x6A, 0x7A], roughness: 0.95, metalness: 0.01 },
  cyan_brick:  { color: [0x7A, 0x8B, 0x7C], roughness: 0.65, metalness: 0.03 },
}

// ===== 材质库 =====
const matDefs = Object.entries(MATERIALS).map(([name, m]) => ({
  name,
  ...m,
  baseColorFactor: [...m.color.map(v => v / 255), 1.0]
}))

// ===== GLB Writer =====

function packLE(value, byteCount) {
  const buf = Buffer.alloc(byteCount)
  let offset = 0
  if (byteCount === 4) buf.writeUInt32LE(value >>> 0, offset)
  else if (byteCount === 2) buf.writeUInt16LE(value, offset)
  else if (byteCount === 1) buf.writeUInt8(value, offset)
  return buf
}

function packF32(arr) { return Buffer.from(new Float32Array(arr).buffer) }
function packU16(arr) { return Buffer.from(new Uint16Array(arr).buffer) }
function packS16(arr) { return Buffer.from(new Int16Array(arr).buffer) }
function packU32(arr) { return Buffer.from(new Uint32Array(arr).buffer) }

function glbEncode(doc) {
  // doc = { meshes: [{ positions, normals, indices, matIndex }], matDefs }
  const B = { POSITION: 0, NORMAL: 1 }
  const CT = { U8: 5121, U16: 5123, U32: 5125, F32: 5126 }
  const VT = { POINTS: 0, LINE: 1, TRIANGLE: 4 }

  const buffers = []
  const meshDefs = []
  const nodeDefs = []

  doc.meshes.forEach((mesh, mi) => {
    // 顶点数据
    const pos = mesh.positions
    const nor = mesh.normals
    const idx = mesh.indices

    const posBytes = packF32(pos)
    const norBytes = packF32(nor)
    const idxBytes = idx.every(v => v < 65536)
      ? packU16(idx)
      : packU32(idx)
    const idxType = idx.every(v => v < 65536) ? CT.U16 : CT.U32

    // 对齐到 4 字节
    const pad = (len, align = 4) => (align - (len % align)) % align

    let acc = 0
    const posView = { bufferView: 0, byteOffset: acc, byteStride: 12 }
    acc += posBytes.length + pad(posBytes.length)
    const norView = { bufferView: 1, byteOffset: acc, byteStride: 12 }
    acc += norBytes.length + pad(norBytes.length)
    const idxView = { bufferView: 2, byteOffset: acc, byteOffset: acc, count: idx.length, type: idxType === CT.U16 ? 'UNSIGNED_SHORT' : 'UNSIGNED_INT' }
    acc += idxBytes.length + pad(idxBytes.length)

    const bufferData = Buffer.concat([
      posBytes, Buffer.alloc(pad(posBytes.length)),
      norBytes, Buffer.alloc(pad(norBytes.length)),
      idxBytes, Buffer.alloc(pad(idxBytes.length))
    ])

    buffers.push(bufferData)

    meshDefs.push({
      name: mesh.name || `mesh_${mi}`,
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1 },
        indices: 2,
        material: mesh.matIndex || 0,
        mode: 'TRIANGLES'
      }]
    })

    nodeDefs.push({ mesh: mi })
  })

  // 构建 glTF JSON
  const gltf = {
    asset: { version: '2.0', generator: 'Chinese-Architecture-Generator' },
    scene: 0,
    scenes: [{ nodes: nodeDefs.map((_, i) => i) }],
    nodes: nodeDefs,
    meshes: meshDefs,
    materials: matDefs.map(m => ({
      name: m.name,
      pbrMetallicRoughness: {
        baseColorFactor: m.baseColorFactor,
        metallicFactor: m.metalness,
        roughnessFactor: m.roughness
      },
      doubleSided: false
    })),
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteStride: 12, target: 34962 },   // POSITION
      { buffer: 0, byteOffset: posPad(len), byteStride: 12, target: 34962 },  // NORMAL
      { buffer: 0, target: 34963 }  // indices (filled below)
    ],
    buffers: [{ byteLength: bufferTotal }]
  }

  // 计算 byteOffset
  let posOffset = 0
  let posLen = buffers[0].slice(0, posBytesLen).length
  let norOffset = posOffset + posLen + pad4(posLen)
  let norLen = buffers[0].slice(norOffset, norOffset + norBytesLen).length
  let idxOffset = norOffset + norLen + pad4(norLen)

  // 重新构建 bufferViews
  let posBytesLen = posPad(pos.length * 4 * 3)
  let norBytesLen = pad4(nor.length * 4 * 3)
  let idxBytesLen = pad4(idx.length * (idx.every(v=>v<65536)?2:4))

  // 实际上从 buffers[0] 获取
  const bd = buffers[0]
  let running = 0
  const bvPos = { buffer: 0, byteOffset: running, byteStride: 12, target: 34962 }
  running += bd.slice(running).length
  // 找 positions 结束位置
  const posEnd = posBytesLen
  const bvNor = { buffer: 0, byteOffset: posEnd, byteStride: 12, target: 34962 }
  const norEnd = posEnd + norBytesLen
  const bvIdx = { buffer: 0, byteOffset: norEnd, target: 34963 }

  gltf.bufferViews = [bvPos, bvNor, bvIdx]

  const bufferTotal = bd.length
  gltf.buffers = [{ byteLength: bufferTotal }]

  // JSON chunk
  const jsonStr = JSON.stringify(gltf)
  const jsonBytes = Buffer.from(jsonStr, 'utf8')
  const jsonPad = pad4(jsonBytes.length)
  const jsonPadded = Buffer.concat([jsonBytes, Buffer.alloc(jsonPad)])

  // BIN chunk
  const binPad = pad4(bufferTotal)
  const binPadded = Buffer.concat([bd, Buffer.alloc(binPad)])

  // GLB header
  const header = Buffer.concat([
    Buffer.from([0x46, 0x4C, 0x42, 0x20]),   // magic: 'glTF'
    packLE(2, 4),                              // version: 2
    packLE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 4)  // total length
  ])

  // JSON chunk header
  const jsonChunkHdr = Buffer.concat([
    packLE(jsonPadded.length, 4),
    packLE(0x4E4F534A, 4)   // 'JSON'
  ])

  // BIN chunk header
  const binChunkHdr = Buffer.concat([
    packLE(binPadded.length, 4),
    packLE(0x004E4942, 4)   // 'BIN\0'
  ])

  return Buffer.concat([header, jsonChunkHdr, jsonPadded, binChunkHdr, binPadded])
}

function pad4(n) { return (4 - (n % 4)) % 4 }

// ===== 从 Three.js Mesh 提取几何数据 =====

function extractMesh(mesh) {
  const geo = mesh.geometry
  if (!geo) return null

  const posAttr = geo.getAttribute('position')
  const norAttr = geo.getAttribute('normal')

  if (!posAttr) return null

  const positions = []
  const normals = []
  const indices = []

  // 位置
  for (let i = 0; i < posAttr.count; i++) {
    positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
  }

  // 法线
  if (norAttr) {
    for (let i = 0; i < norAttr.count; i++) {
      normals.push(norAttr.getX(i), norAttr.getY(i), norAttr.getZ(i))
    }
  } else {
    // 计算法线
    mesh.updateWorldMatrix(true, false)
    geo.computeVertexNormals()
    const na = geo.getAttribute('normal')
    if (na) {
      for (let i = 0; i < na.count; i++) {
        normals.push(na.getX(i), na.getY(i), na.getZ(i))
      }
    } else {
      for (let i = 0; i < posAttr.count; i++) normals.push(0, 1, 0)
    }
  }

  // 索引
  if (geo.index) {
    for (let i = 0; i < geo.index.count; i++) indices.push(geo.index.getX(i))
  } else {
    for (let i = 0; i < posAttr.count; i++) indices.push(i)
  }

  // 缩放（应用到位置）
  const sx = mesh.scale.x, sy = mesh.scale.y, sz = mesh.scale.z
  const wPos = new Float32Array(positions.length)
  for (let i = 0; i < positions.length; i += 3) {
    wPos[i] = positions[i] * sx
    wPos[i + 1] = positions[i + 1] * sy
    wPos[i + 2] = positions[i + 2] * sz
  }

  // 世界变换应用到法线
  const wNor = new Float32Array(normals.length)
  mesh.updateWorldMatrix(true, false)
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2]
    wNor[i] = nm.elements[0] * nx + nm.elements[3] * ny + nm.elements[6] * nz
    wNor[i + 1] = nm.elements[1] * nx + nm.elements[4] * ny + nm.elements[7] * nz
    wNor[i + 2] = nm.elements[2] * nx + nm.elements[5] * ny + nm.elements[8] * nz
  }

  return {
    positions: Array.from(wPos),
    normals: Array.from(wNor),
    indices,
    matName: mesh.material?.name || 'wood'
  }
}

function getMatIndex(matName) {
  const idx = matDefs.findIndex(m => m.name === matName)
  return idx >= 0 ? idx : 0
}

function groupToMeshes(group, name = '') {
  const meshes = []
  group.traverse(obj => {
    if (obj.isMesh && obj.geometry) {
      const data = extractMesh(obj)
      if (data) {
        data.name = name || obj.name || 'mesh'
        data.matIndex = getMatIndex(data.matName)
        meshes.push(data)
      }
    }
  })
  return meshes
}

// ===== 简化版 GLB 写入 =====

function writeGLB(meshes, outPath) {
  // 合并所有顶点和索引
  let allPositions = []
  let allNormals = []
  let allIndices = []
  let vertexOffset = 0

  const meshOffsets = []

  meshes.forEach(m => {
    const offset = vertexOffset
    meshOffsets.push({ offset, count: m.indices.length })
    allPositions.push(...m.positions)
    allNormals.push(...m.normals)
    allIndices.push(...m.indices.map(i => i + offset))
    vertexOffset += m.positions.length / 3
  })

  // Buffer views
  const posBytes = packF32(allPositions)
  const norBytes = packF32(allNormals)
  const idxArr = allIndices.every(v => v < 65536)
    ? Array.from(allIndices).map(Number)
    : allIndices.map(Number)
  const idxBytes = allIndices.every(v => v < 65536)
    ? packU16(idxArr)
    : packU32(idxArr)

  const pad = (n) => (4 - (n % 4)) % 4

  const posPad = pad(posBytes.length)
  const norPad = pad(norBytes.length)
  const idxPad = pad(idxBytes.length)

  const posOffset = 0
  const norOffset = posBytes.length + posPad
  const idxOffset = norOffset + norBytes.length + norPad
  const totalBin = idxOffset + idxBytes.length + idxPad

  const binData = Buffer.concat([
    posBytes, Buffer.alloc(posPad),
    norBytes, Buffer.alloc(norPad),
    idxBytes, Buffer.alloc(idxPad)
  ])

  // Material assignment: per-mesh primitives
  const primitives = meshes.map((m, i) => ({
    attributes: { POSITION: 0, NORMAL: 1 },
    indices: 2,
    material: m.matIndex,
    mode: 4
  }))

  // Map indices for each mesh
  const meshPrimitiveIndices = meshes.map((m, i) => {
    const off = meshOffsets[i].offset
    return m.indices.map(idx => idx + off)
  })

  // Build separate primitives per mesh
  const gltfMeshes = meshes.map((m, i) => ({
    name: m.name,
    primitives: [{
      attributes: { POSITION: 0, NORMAL: 1 },
      indices: 2,
      material: m.matIndex,
      mode: 4
    }]
  }))

  const gltf = {
    asset: { version: '2.0', generator: 'Chinese-Architecture-Gen' },
    scene: 0,
    scenes: [{ nodes: meshes.map((_, i) => i) }],
    nodes: meshes.map((m, i) => ({ mesh: i, name: m.name })),
    meshes: gltfMeshes,
    materials: matDefs.map(m => ({
      name: m.name,
      pbrMetallicRoughness: {
        baseColorFactor: m.baseColorFactor,
        metallicFactor: m.metalness,
        roughnessFactor: m.roughness
      },
      doubleSided: false
    })),
    bufferViews: [
      { buffer: 0, byteOffset: posOffset, byteStride: 12, target: 34962 },
      { buffer: 0, byteOffset: norOffset, byteStride: 12, target: 34962 },
      { buffer: 0, byteOffset: idxOffset, target: 34963 }
    ],
    buffers: [{ byteLength: totalBin }]
  }

  // Per-primitive index accessors
  // Actually we need separate accessor for each mesh's indices
  // Simplification: single large index buffer with all meshes
  // We map by using mesh groups with different byteOffset in accessor

  // Rebuild: single index buffer but per-mesh accessors
  const gltfV2 = {
    asset: { version: '2.0', generator: 'Chinese-Architecture-Gen' },
    scene: 0,
    scenes: [{ nodes: meshes.map((_, i) => i) }],
    nodes: meshes.map((m, i) => ({ mesh: i, name: m.name })),
    meshes: gltfMeshes,
    materials: matDefs.map(m => ({
      name: m.name,
      pbrMetallicRoughness: {
        baseColorFactor: m.baseColorFactor,
        metallicFactor: m.metalness,
        roughnessFactor: m.roughness
      },
      doubleSided: false
    })),
    bufferViews: [
      { buffer: 0, byteOffset: posOffset, byteStride: 12, target: 34962 },
      { buffer: 0, byteOffset: norOffset, byteStride: 12, target: 34962 },
      { buffer: 0, byteOffset: idxOffset, target: 34963 }
    ],
    buffers: [{ byteLength: totalBin }]
  }

  // Add accessors
  gltfV2.accessors = [
    { bufferView: 0, componentType: 5126, count: allPositions.length / 3, type: 'VEC3', max: getMax(allPositions, 3), min: getMin(allPositions, 3) },
    { bufferView: 1, componentType: 5126, count: allNormals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: allIndices.every(v => v < 65536) ? 5123 : 5125, count: allIndices.length, type: 'SCALAR' }
  ]

  // Update primitives to reference accessors
  // Position accessor = 0, Normal = 1, Index = 2
  gltfV2.meshes = meshes.map((m, i) => ({
    name: m.name,
    primitives: [{
      attributes: { POSITION: 0, NORMAL: 1 },
      indices: 2,
      material: m.matIndex,
      mode: 4
    }]
  }))

  const jsonStr = JSON.stringify(gltfV2)
  const jsonBytes = Buffer.from(jsonStr, 'utf8')
  const jsonPad = pad(jsonBytes.length)
  const jsonPadded = Buffer.concat([jsonBytes, Buffer.alloc(jsonPad)])

  const binChunkHdr = Buffer.concat([packLE(binData.length, 4), Buffer.from([0x42, 0x49, 0x4E, 0x00])])
  const jsonChunkHdr = Buffer.concat([packLE(jsonPadded.length, 4), Buffer.from([0x4A, 0x53, 0x4F, 0x4E])])

  const glb = Buffer.concat([
    Buffer.from([0x46, 0x4C, 0x42, 0x20]),  // 'glTF'
    packLE(2, 4),
    packLE(12 + 8 + jsonPadded.length + 8 + binData.length, 4),
    jsonChunkHdr, jsonPadded,
    binChunkHdr, binData
  ])

  fs.writeFileSync(outPath, glb)
}

function getMax(arr, stride) {
  const result = []
  for (let c = 0; c < stride; c++) {
    let m = -Infinity
    for (let i = c; i < arr.length; i += stride) m = Math.max(m, arr[i])
    result.push(m)
  }
  return result
}

function getMin(arr, stride) {
  const result = []
  for (let c = 0; c < stride; c++) {
    let m = Infinity
    for (let i = c; i < arr.length; i += stride) m = Math.min(m, arr[i])
    result.push(m)
  }
  return result
}

// ===== Three.js 辅助函数 =====

function mMat(hex, opts = {}) {
  const r = (hex >> 16) & 0xFF, g = (hex >> 8) & 0xFF, b = hex & 0xFF
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(r/255, g/255, b/255), ...opts, name: opts._name || 'wood' })
}

// ===== 故宫太和殿 =====
function buildGugong() {
  const group = new THREE.Group()
  const redWall = mMat(0xBB2211, { roughness: 0.65, metalness: 0.05, _name: 'red_wall' })
  const yellowRoof = mMat(0xD4A017, { roughness: 0.35, metalness: 0.25, _name: 'yellow_glaze' })
  const wood = mMat(0x8B6914, { roughness: 0.70, metalness: 0.05, _name: 'wood' })
  const darkWood = mMat(0x5A3D0E, { roughness: 0.75, metalness: 0.02, _name: 'dark_wood' })
  const stone = mMat(0x9A8A7A, { roughness: 0.85, metalness: 0.02, _name: 'stone' })
  const gold = mMat(0xDAA520, { roughness: 0.15, metalness: 0.80, _name: 'gold' })
  const doorMat = mMat(0x4A2A0A, { roughness: 0.80, metalness: 0.02, _name: 'door' })
  const floorMat = mMat(0x7A6850, { roughness: 0.75, _name: 'stone' })

  // 台基
  ;[{ s: 8.5, h: 1.0 }, { s: 7.5, h: 0.5 }, { s: 6.8, h: 0.4 }].forEach(({ s, h }, i) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(s * 2, h, s * 1.6), stone)
    step.position.y = -2.2 + i * h
    group.add(step)
  })

  // 柱网
  const colH = 5.8
  for (let x = -5; x <= 5; x += 2.5) {
    for (let z = -4; z <= 4; z += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, colH, 16), redWall)
      col.position.set(x, 0.8, z)
      group.add(col)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.2, 12), stone)
      base.position.set(x, -2.2, z)
      group.add(base)
    }
  }

  // 额枋
  ;[4.2, -4.2].forEach(z => {
    const ef = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 0.2), wood)
    ef.position.set(0, 3.85, z)
    group.add(ef)
  })

  // 斗拱
  for (let x = -5; x <= 5; x += 1.25) {
    ;[4.4, -4.4].forEach(z => {
      const dou = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.38), wood)
      dou.position.set(x, 4.15, z)
      group.add(dou)
    })
  }
  ;[4.42, -4.42].forEach(z => {
    const gong = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.12, 0.16), wood)
    gong.position.set(0, 4.3, z)
    group.add(gong)
  })

  // 屋顶
  const roofBody = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 10), yellowRoof)
  roofBody.position.y = 4.5
  group.add(roofBody)
  ;[-1, 1].forEach(side => {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 10), yellowRoof)
    slope.position.set(side * 6.1, 4.95, 0)
    slope.rotation.z = side * 0.15
    group.add(slope)
  })

  // 飞檐曲线
  ;[1, -1].forEach(zSign => {
    const pts = []
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      pts.push(new THREE.Vector3(6.2 + t * 1.5, 4.38 + Math.sin(t * Math.PI) * 0.35 - t * 0.18, zSign * (4.2 + t * 1.8)))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.06, 8, false), yellowRoof)
    group.add(tube)
  })

  // 正脊
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 10.5), gold)
  ridge.position.y = 5.5
  group.add(ridge)
  for (let z = -3.5; z <= 3.5; z += 1.2) {
    const beast = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 6), gold)
    beast.position.set(0, 5.75, z)
    group.add(beast)
  }
  ;[-1, 1].forEach(side => {
    const chiwen = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 4), gold)
    chiwen.position.set(side * 6.5, 5.6, 0)
    chiwen.rotation.z = side * Math.PI / 2
    group.add(chiwen)
  })

  // 门
  ;[-2.5, 0, 2.5].forEach(x => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.2), doorMat)
    door.position.set(x, -0.3, 4.25)
    group.add(door)
    for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
      for (let dy = -1.5; dy <= 0.5; dy += 0.5) {
        const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), gold)
        nail.position.set(x + dx, dy, 4.4)
        group.add(nail)
      }
    }
  })

  // 金砖地面
  const floor = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.12, 7.5), floorMat)
  floor.position.y = -1.5
  group.add(floor)

  return group
}

// ===== 天坛祈年殿 =====
function buildTiantan() {
  const group = new THREE.Group()
  const blueGlaze = mMat(0x1A5B8A, { roughness: 0.35, metalness: 0.30, _name: 'blue_glaze' })
  const white = mMat(0xE0D8CA, { roughness: 0.50, metalness: 0.05, _name: 'white' })
  const gold = mMat(0xDAA520, { roughness: 0.15, metalness: 0.80, _name: 'gold' })

  // 三层台基
  const tiers = [{ r: 6.0, h: 0.7 }, { r: 5.0, h: 0.6 }, { r: 4.0, h: 0.55 }]
  tiers.forEach((t, i) => {
    const step = new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r + 0.1, t.h, 48), white)
    step.position.y = -2.5 + i * 0.7
    group.add(step)
    for (let j = 0; j < 32; j++) {
      const a = (j / 32) * Math.PI * 2
      const r = t.r - 0.15
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), white)
      rail.position.set(Math.cos(a) * r, step.position.y + t.h / 2 + 0.28, Math.sin(a) * r)
      group.add(rail)
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), white)
      top.position.set(Math.cos(a) * r, step.position.y + t.h / 2 + 0.55, Math.sin(a) * r)
      group.add(top)
    }
  })

  // 三重屋檐
  const buildings = [
    { r: 3.6, wallH: 2.0, roofY: 1.0, coneH: 0.9 },
    { r: 2.9, wallH: 1.6, roofY: -0.8, coneH: 0.7 },
    { r: 2.2, wallH: 1.2, roofY: -2.6, coneH: 0.55 }
  ]
  buildings.forEach((b, idx) => {
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(b.r, b.r * 1.06, b.wallH, 36), white)
    wall.position.y = b.roofY - b.wallH / 2 - 0.3
    group.add(wall)
    const roofEdge = new THREE.Mesh(new THREE.CylinderGeometry(b.r * 1.12, b.r * 1.06, 0.22, 36), blueGlaze)
    roofEdge.position.y = b.roofY
    group.add(roofEdge)
    if (idx < 2) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(b.r * 1.05, b.coneH, 36), blueGlaze)
      cone.position.y = b.roofY + b.coneH / 2 + 0.15
      group.add(cone)
    }
  })

  // 金顶
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), gold)
  dome.position.y = 1.5
  group.add(dome)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.9, 8), gold)
  spire.position.y = 1.6
  group.add(spire)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 8), gold)
  ball.position.y = 2.05
  group.add(ball)

  return group
}

// ===== 应县木塔 =====
function buildYingxianPagoda() {
  const group = new THREE.Group()
  const wood = mMat(0x8B6914, { roughness: 0.70, metalness: 0.05, _name: 'wood' })
  const darkWood = mMat(0x5A3D0E, { roughness: 0.75, metalness: 0.02, _name: 'dark_wood' })
  const roofGrey = mMat(0x6A6A65, { roughness: 0.50, metalness: 0.10, _name: 'roof_grey' })
  const gold = mMat(0xDAA520, { roughness: 0.15, metalness: 0.80, _name: 'gold' })

  // 塔刹
  const xianglun = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 10, 36), gold)
  xianglun.rotation.x = Math.PI / 2; xianglun.position.y = 9.5; group.add(xianglun)
  const xianglun2 = xianglun.clone(); xianglun2.position.y = 9.3; xianglun2.scale.setScalar(0.75); group.add(xianglun2)
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.2, 8), gold)
  canopy.position.y = 9.65; group.add(canopy)
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3 - i * 0.06, 0.04, 8, 24), gold)
    ring.rotation.x = Math.PI / 2; ring.position.y = 9.7 + i * 0.12; group.add(ring)
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 2.0, 8), gold)
  spire.position.y = 10.1; group.add(spire)
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.4, 8), gold)
  tip.position.y = 11.1; group.add(tip)

  // 五层
  for (let floor = 4; floor >= 0; floor--) {
    const baseY = floor * 1.8 - 0.8
    const scale = 2.1 - floor * 0.22

    const slab = new THREE.Mesh(new THREE.BoxGeometry(scale * 2, 0.12, scale * 2), wood)
    slab.position.y = baseY; group.add(slab)

    if (floor > 0) {
      const darkSlab = new THREE.Mesh(new THREE.BoxGeometry(scale * 1.95, 0.1, scale * 1.95), darkWood)
      darkSlab.position.y = baseY - 0.5; group.add(darkSlab)
    }

    const colH = 1.3
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const r = scale * 0.85
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, colH, 10), wood)
      col.position.set(Math.cos(a) * r, baseY + colH / 2 + 0.12, Math.sin(a) * r); group.add(col)
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const r = scale * 0.92
      const dou = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), wood)
      dou.position.set(Math.cos(a) * r, baseY + colH + 0.3, Math.sin(a) * r); group.add(dou)
    }

    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(scale * 2.5, 0.14, scale * 2.5), roofGrey)
    roofSlab.position.y = baseY + colH + 0.4; group.add(roofSlab)

    ;[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz]) => {
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), roofGrey)
      corner.position.set(sx * scale * 1.25, baseY + colH + 0.42, sz * scale * 1.25)
      group.add(corner)
    })

    if (floor > 0 && floor < 5) {
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(scale * 1.03, scale * 1.06, 0.15, 32), roofGrey)
      waist.position.y = baseY - 0.35; group.add(waist)
    }
  }

  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 5), darkWood)
  base.position.y = -1.1; group.add(base)
  // 底层柱
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 1.4, 10), wood)
    col.position.set(Math.cos(a) * 1.8, -0.35, Math.sin(a) * 1.8); group.add(col)
  }
  const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 4.2), wood)
  floorSlab.position.y = -0.5; group.add(floorSlab)

  return group
}

// ===== 布达拉宫 =====
function buildPotalaPalace() {
  const group = new THREE.Group()
  const white = mMat(0xE8E4DC, { roughness: 0.50, metalness: 0.05, _name: 'white' })
  const red = mMat(0xAA1A1A, { roughness: 0.60, metalness: 0.05, _name: 'red_wall' })
  const stone = mMat(0x6A6A62, { roughness: 0.85, metalness: 0.02, _name: 'stone' })
  const gold = mMat(0xDAA520, { roughness: 0.15, metalness: 0.80, _name: 'gold' })
  const winMat = mMat(0x2A1800, { roughness: 0.80, metalness: 0.02, _name: 'door' })

  // 山体
  const mountain = new THREE.Mesh(new THREE.CylinderGeometry(10, 14, 5, 32), stone)
  mountain.position.y = -4; group.add(mountain)

  // 白宫
  for (let i = 0; i < 7; i++) {
    const h = 0.7, y = -1.5 + i * 0.72
    const w = 11.5 - i * 0.15, d = 9.5 - i * 0.12
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), white)
    floor.position.y = y + h / 2; group.add(floor)
    for (let wx = -3.5; wx <= 3.5; wx += 1.75) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), winMat)
      win.position.set(wx, y + h / 2 + 0.12, d / 2 + 0.01); group.add(win)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.05), gold)
      frame.position.set(wx, y + h / 2 + 0.12, d / 2 + 0.02); group.add(frame)
    }
  }

  // 红宫
  for (let i = 0; i < 13; i++) {
    const h = 0.52, y = 3.55 + i * 0.54
    const w = 9.5 - i * 0.1, d = 7.5 - i * 0.08
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), red)
    floor.position.y = y + h / 2; group.add(floor)
    if (i < 8) {
      for (let wx = -3; wx <= 3; wx += 1.5) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.1), winMat)
        win.position.set(wx, y + h / 2 + 0.1, d / 2 + 0.01); group.add(win)
      }
    }
  }

  // 金顶群
  const topY = 10.8
  ;[-4, 0, 4].forEach(xOff => {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.8, 16), gold)
    top.position.set(xOff, topY, 0); group.add(top)
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.4, 16), gold)
    cone.position.set(xOff, topY + 1.6, 0); group.add(cone)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.5, 8), gold)
    spire.position.set(xOff, topY + 3.0, 0); group.add(spire)
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), gold)
    ball.position.set(xOff, topY + 3.75, 0); group.add(ball)
  })

  // 蹬道
  const pathPts = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    pathPts.push(new THREE.Vector3(8 - t * 5 - Math.sin(t * Math.PI * 4) * 0.5, -1.5 + t * 12, 7 - t * 14))
  }
  const pathCurve = new THREE.CatmullRomCurve3(pathPts)
  const pathMesh = new THREE.Mesh(new THREE.TubeGeometry(pathCurve, 40, 0.2, 8, false), stone)
  group.add(pathMesh)

  return group
}

// ===== 悬空寺 =====
function buildXuankongTemple() {
  const group = new THREE.Group()
  const cliff = mMat(0x6A5A4A, { roughness: 0.90, metalness: 0.02, _name: 'cliff' })
  const cliffDetail = mMat(0x5A4A3A, { roughness: 0.92, metalness: 0.01, _name: 'cliff_detail' })
  const wall = mMat(0x7A8B7C, { roughness: 0.65, metalness: 0.03, _name: 'cyan_brick' })
  const wood = mMat(0x7A5A14, { roughness: 0.70, metalness: 0.05, _name: 'wood' })
  const roof = mMat(0x5A5A55, { roughness: 0.50, metalness: 0.10, _name: 'roof_grey' })
  const tree = mMat(0x4A7A4A, { roughness: 0.85, metalness: 0.02, _name: 'green_tree' })

  // 悬崖
  const cliffMesh = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 6), cliff)
  cliffMesh.position.set(0, -4, 0); group.add(cliffMesh)

  for (let y = -8; y < 5; y += 1.8) {
    for (let x = -6; x < 6; x += 1.8) {
      if (Math.random() > 0.4) continue
      const detail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.2), cliffDetail)
      detail.position.set(x, y, 3.0); group.add(detail)
    }
  }

  // 植被
  for (let i = 0; i < 15; i++) {
    const x = (Math.random() - 0.5) * 12, y = -4 + Math.random() * 8
    const tr = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 6), tree)
    tr.position.set(x, y, 3.1); group.add(tr)
  }

  // 建筑
  const bldgs = [
    { x: 2.5, y: 0.5, w: 3.8, h: 0.85, d: 1.8, z: 2 },
    { x: -0.5, y: 1.8, w: 2.5, h: 0.75, d: 1.5, z: 1.8 },
    { x: -2.8, y: 3.0, w: 2.2, h: 0.65, d: 1.3, z: 1.6 },
    { x: 0.8, y: 4.0, w: 1.8, h: 0.6, d: 1.2, z: 1.4 },
  ]
  bldgs.forEach(b => {
    const wallM = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), wall)
    wallM.position.set(b.x, b.y, b.z); group.add(wallM)
    const roofM = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.5, 0.12, b.d + 0.5), roof)
    roofM.position.set(b.x, b.y + b.h / 2 + 0.08, b.z); group.add(roofM)
    ;[-1, 1].forEach(side => {
      const eave = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.3, 0.08, 0.2), roof)
      eave.position.set(b.x, b.y + b.h / 2 + 0.1, b.z + side * (b.d / 2 + 0.1)); group.add(eave)
    })
  })

  // 支撑柱
  const pillarData = [
    { x: 2.5, z: 3.0 }, { x: 1.2, z: 3.0 }, { x: 3.8, z: 2.9 },
    { x: -0.5, z: 2.7 }, { x: -1.8, z: 2.6 }, { x: -2.8, z: 2.5 }, { x: -1.2, z: 2.5 },
  ]
  pillarData.forEach(p => {
    const h = 1.5 + Math.random() * 1.8
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 8), wood)
    pillar.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.25
    pillar.position.set(p.x, -0.5, p.z); group.add(pillar)
  })

  // 栈道
  for (let i = 0; i < 22; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 1.5), wood)
    plank.position.set(-1.5 + i * 0.25, 0.15, 3.2); group.add(plank)
  }
  for (let i = 0; i <= 22; i += 3) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), wood)
    rail.position.set(-1.5 + i * 0.25, 0.45, 2.4); group.add(rail)
    const railB = rail.clone(); railB.position.z = 4.0; group.add(railB)
  }

  return group
}

// ===== 赵州桥 =====
function buildZhaozhouBridge() {
  const group = new THREE.Group()
  const stone = mMat(0x8A8A82, { roughness: 0.85, metalness: 0.02, _name: 'stone' })
  const lightStone = mMat(0x9A9A92, { roughness: 0.80, metalness: 0.02, _name: 'light_stone' })
  const darkStone = mMat(0x6A6A62, { roughness: 0.88, metalness: 0.02, _name: 'dark_stone' })
  const gold = mMat(0xDAA520, { roughness: 0.15, metalness: 0.80, _name: 'gold' })
  const river = mMat(0x4A6A7A, { roughness: 0.95, metalness: 0.01, _name: 'riverbed' })
  const bank = mMat(0x6A7A62, { roughness: 0.90, metalness: 0.02, _name: 'bank' })

  // 河床
  const riverbed = new THREE.Mesh(new THREE.PlaneGeometry(25, 12), river)
  riverbed.rotation.x = -Math.PI / 2; riverbed.position.y = -3.5; group.add(riverbed)
  ;[-1, 1].forEach(side => {
    const bankM = new THREE.Mesh(new THREE.BoxGeometry(25, 2, 4), bank)
    bankM.position.set(0, -2.5, side * 7); group.add(bankM)
  })

  // 大拱
  const mainArch = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.55, 14, 56, Math.PI), stone)
  mainArch.rotation.z = Math.PI; mainArch.position.y = -1.5; group.add(mainArch)

  // 小拱
  ;[-3.5, 3.5].forEach((yOff, idx) => {
    const small = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.3, 10, 28, Math.PI), stone)
    small.rotation.z = Math.PI; small.position.set(0, -0.8 + yOff * 0.4, 0); group.add(small)
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.28, 0.9), lightStone)
    top.position.set(0, small.position.y + 1.0, 0); group.add(top)
  })

  // 桥面
  const deck = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 3.2), stone)
  deck.position.y = 0.4; group.add(deck)

  // 栏杆
  const railH = 0.52
  for (let x = -5; x <= 5; x += 1.0) {
    ;[1.8, -1.8].forEach(z => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.15, railH, 0.15), lightStone)
      pillar.position.set(x, 0.4 + railH / 2, z); group.add(pillar)
    })
    if (x < 5) {
      ;[1.8, -1.8].forEach(z => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, railH - 0.14, 0.1), stone)
        panel.position.set(x + 0.5, 0.4 + railH / 2, z); group.add(panel)
      })
    }
  }

  // 桥墩
  ;[-3.5, 0, 3.5].forEach(x => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.2, 2.6), stone)
    pier.position.set(x, -1.2, 0); group.add(pier)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 4), darkStone)
    tip.rotation.z = Math.PI / 2; tip.position.set(x - 0.8, -1.2, 0); group.add(tip)
  })

  // 龙头
  ;[-1, 1].forEach(side => {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.6, 8), stone)
    head.position.set(-5.5, 0.4, side * 0.9); head.rotation.z = side * Math.PI / 4; group.add(head)
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), darkStone)
    horn.position.set(-5.5 + side * 0.15, 0.6, side * 0.9); group.add(horn)
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), gold)
    eye.position.set(-5.5 + side * 0.18, 0.5, side * 0.9); group.add(eye)
  })

  // 题刻
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.15), darkStone)
  plaque.position.set(4, 0.72, 1.9); group.add(plaque)

  return group
}

// ===== 主流程 =====
async function main() {
  console.log('🎯 中国古代建筑 3D 模型生成器')
  console.log('═'.repeat(50))

  const models = [
    { fn: buildGugong,          name: 'gugong',          label: '故宫太和殿' },
    { fn: buildTiantan,         name: 'tiantan',         label: '天坛祈年殿' },
    { fn: buildYingxianPagoda,  name: 'yingxian-pagoda',  label: '应县木塔' },
    { fn: buildPotalaPalace,    name: 'potala-palace',   label: '布达拉宫' },
    { fn: buildXuankongTemple, name: 'xuankong-temple',  label: '悬空寺' },
    { fn: buildZhaozhouBridge,  name: 'zhaozhou-bridge', label: '赵州桥' },
  ]

  for (const { fn, name, label } of models) {
    process.stdout.write(`📦 生成: ${label} ... `)
    const group = fn()
    const meshes = groupToMeshes(group, name)
    const outPath = path.join(OUT_DIR, `${name}.glb`)
    writeGLB(meshes, outPath)
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1)
    console.log(`✅ ${name}.glb (${kb} KB)`)
  }

  console.log('\n' + '═'.repeat(50))
  console.log('🎉 全部 6 座建筑模型生成完毕！')
  console.log(`📁 输出目录: public/models/`)
  console.log('\n模型清单:')
  models.forEach(m => console.log(`  • ${m.name}.glb  — ${m.label}`))
}

main().catch(err => {
  console.error('\n❌ 生成失败:', err.message)
  process.exit(1)
})
