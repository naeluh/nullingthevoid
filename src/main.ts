import './style.css';
import Matter from 'matter-js';

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Common = Matter.Common;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;

// create an engine
const engine = Engine.create();
engine.gravity.scale = 0.0009;
const world = engine.world;

const canvasContainer = document.getElementById('app') || null;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const get_random_color = () => {
  const h = rand(1, 360);
  const s = rand(0, 100);
  const l = rand(0, 100);
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
};

if (canvasContainer) {
  const render = Render.create({
    element: canvasContainer,
    engine: engine,
    options: {
      width: canvasContainer?.clientWidth,
      height: canvasContainer?.clientHeight,
      wireframes: false,
      background: ''
    }
  });

  const particles: any = [];

  const updateParticles = function () {
    const halfParticle = render.canvas.width / 2;
    const particleOptions = {
      count: render.canvas.width * render.canvas.height * 0.00005 + 100,
      size: {
        // min: 50,
        // max: 100
        min: Matter.Common.random(0.03, 0.08) * render.canvas.width,
        max:
          Matter.Common.random(0.08, 0.1) * render.canvas.width +
            render.canvas.width <=
          1024
            ? 100
            : (halfParticle / render.canvas.width) * 100
      },
      bounce: 1.1
    };

    for (let i = 0; i < particleOptions.count; i++) {
      const c = get_random_color();
      const x = Matter.Common.random(-render.canvas.width, render.canvas.width);
      const y = Matter.Common.random(
        -render.canvas.height,
        render.canvas.height / 5
      );
      const size = Matter.Common.random(
        particleOptions.size.min,
        particleOptions.size.max
      );
      const p = Bodies.rectangle(x, y, size, size, {
        restitution: particleOptions.bounce,
        render: { fillStyle: c },
        frictionAir: Common.random(0.003, 0.1),
        mass: 0.01
      });
      Matter.Body.setVelocity(p, { x: 0, y: Matter.Common.random(1, 10) });
      particles.push(p);
    }
  };

  const updateMouse = () => {
    interface MouseConstraintProps extends Matter.IMouseConstraintDefinition {
      stiffness?: any;
      render?: {
        visible?: any;
      };
    }
    const mouse = Mouse.create(render.canvas);
    const options: MouseConstraintProps = {
      stiffness: 0.01,
      render: {
        visible: false
      }
    };
    const mouseConstraint = MouseConstraint.create(engine, options);
    World.add(world, mouseConstraint);
    render.mouse = mouse;
  };

  const addToWorld = () => {
    if (!canvasContainer.clientWidth || !canvasContainer.clientHeight) return;
    particles.length = 0;
    updateParticles();
    World.add(world, particles);
    updateMouse();
  };

  addToWorld();

  const clearWorld = () => {
    World.clear(world, false);
  };

  const reset = () => {
    clearWorld();
    addToWorld();
  };

  window.addEventListener('resize', () => {
    (render.options.width = render.canvas.width = canvasContainer.clientWidth),
      (render.options.height = render.canvas.height =
        canvasContainer.clientHeight);

    reset();
  });

  Matter.Runner.run(engine);

  Render.run(render);

  Matter.Events.on(render, 'afterRender', () => {
    particles.forEach((p: any) => {
      if (p.position.y > render.canvas.height) {
        Matter.Body.setVelocity(p, { x: 0, y: Matter.Common.random(1, 30) });

        const x = Matter.Common.random(
          -render.canvas.width,
          render.canvas.width
        );
        const y = Matter.Common.random(
          -render.canvas.height,
          render.canvas.height / 5
        );
        Matter.Body.setPosition(p, { x: x, y: y });
      }
    });
  });
} else {
  document.body.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
}
