// lab.js
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.1);

  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 6, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  light.intensity = 1.2;

  // Ground / workbench
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 8, height: 8 }, scene);
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  ground.material = groundMat;

  // Cube / Pi board
  const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 1 }, scene);
  cube.position.y = 0.5;
  const cubeMat = new BABYLON.StandardMaterial("cubeMat", scene);
  cubeMat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 1);
  cube.material = cubeMat;

  // Sidekick avatar placeholder (a glowing orb for now)
  const avatar = BABYLON.MeshBuilder.CreateSphere("avatar", { diameter: 0.6 }, scene);
  avatar.position = new BABYLON.Vector3(-2, 1, 0);
  const avatarMat = new BABYLON.StandardMaterial("avatarMat", scene);
  avatarMat.emissiveColor = new BABYLON.Color3(0.8, 0.2, 1);
  avatar.material = avatarMat;

  // Floating animation
  scene.registerBeforeRender(() => {
    avatar.position.y = 1 + 0.2 * Math.sin(performance.now() / 500);
  });

  // Overlay talk box
  const overlay = document.getElementById("aiOverlay");
  let messages = [
    "👋 Hey Stone, your lab’s online.",
    "💡 Click the cube to power up your Pi board.",
    "🧠 Systems ready — awaiting your command.",
    "⚙️ Agentic protocols standing by."
  ];
  let msgIndex = 0;
  function speakNext() {
    overlay.textContent = messages[msgIndex];
    msgIndex = (msgIndex + 1) % messages.length;
  }

  // Click to interact
  cube.actionManager = new BABYLON.ActionManager(scene);
  cube.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      cubeMat.emissiveColor = new BABYLON.Color3(1, 0.3, 0.3);
      speakNext();
      setTimeout(() => cubeMat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 1), 600);
    })
  );

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});
