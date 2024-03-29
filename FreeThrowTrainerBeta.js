import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1],  // bottom
            [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1], // top
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], // left
            [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1], // right
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], // front
            [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]); // back
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}
export class FreeThrowTrainer extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            cube: new Cube(),
            sphere: new defs.Subdivision_Sphere(4),
            sphere1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            sphere2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            sphere3: new defs.Subdivision_Sphere(3),
            sphere5: new defs.Subdivision_Sphere(5),
            circle: new defs.Regular_2D_Polygon(1, 15),
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            backboard: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#1a40fd")}),
            backboard_holder: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            hoop: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#ff0000")}),

            basketBall: new Material(new defs.Phong_Shader(), {ambient: 1, color: hex_color ("#cc5500")}),

        }

        this.initial_camera_location = Mat4.translation(0, -3, 10).times(Mat4.look_at(vec3(0, 4, 10), vec3(0, 0, 0), vec3(0, 1, 0)));
    }

    make_control_panel() {
        this.key_triggered_button("Shoot", ["Control", "S"], () => this.shotToggleOn() );
        this.live_string(box => {
            box.textContent = "Your Score: " + this.totalScore + " points";
        }, );
        this.new_line();
        this.key_triggered_button("Increase Vertical Angle", ["Control", "+"], () => this.verticalAngleIncrease() );        
        this.live_string(box => {
            box.textContent = "Vertical Angle: " + this.verticalAngle + " degrees  ";
        }, );
        this.key_triggered_button("Decrease Vertical Angle", ["Control", "-"], () => this.verticalAngleDecrease() );
        this.key_triggered_button("Increase Horizontal Angle", ["Control", "1"], () => this.horizontalAngleIncrease() );        
        this.live_string(box => {
            box.textContent = "Horizontal Angle: " + this.horizontalAngle + " degrees  ";
        }, );
        this.key_triggered_button("Decrease Horizontal Angle", ["Control", "2"], () => this.horizontalAngleDecrease() );       
        this.key_triggered_button("Increase Initial Velocity", ["Control", "3"], () => this.initialVelocityIncrease() );
        this.live_string(box => {
            box.textContent = "Initial Velocity: " + this.initialVelocity.toFixed(1) + " m/s  ";
        }, );
        this.key_triggered_button("Decrease Initial Velocity", ["Control", "4"], () => this.initialVelocityDecrease() );
        this.key_triggered_button("Increase Distance to Hoop", ["Control", "5"], () => this.distanceToHoopIncrease() );        
        this.live_string(box => {
            box.textContent = "Distance: " + this.distanceToHoop.toFixed(1) + " meter(s)  ";
        }, );
        this.key_triggered_button("Decrease Distance to Hoop", ["Control", "6"], () => this.distanceToHoopDecrease() );       
        this.key_triggered_button("Increase Acceleration Due to Gravity", ["Control", "7"], () => this.accDueToGravIncrease() );    
        this.live_string(box => {
            box.textContent = "Gravity: " + this.accDueToGrav.toFixed(1) + " m/s^2  ";
        }, );
        this.key_triggered_button("Decrease Acceleration Due to Gravity", ["Control", "8"], () => this.accDueToGravDecrease() );      
        this.key_triggered_button("Attach camera to Basketball", ["Control", "B"], () => this.attached = () => this.basketBall );
        this.key_triggered_button("Hoop View", ["Control", "H"], () => this.attached = () => this.hoopView );
        this.key_triggered_button("Return to default view", ["Control", "0"], () =>     this.attached = () => this.defaultCamera );
    }

    defaultCamera = Mat4.inverse(Mat4.translation(0, -3, 10).times(Mat4.look_at(vec3(0, 4, 10), vec3(0, 0, 0), vec3(0, 1, 0))));
    verticalAngle = 45;
    horizontalAngle = 3;
    initialVelocity = 10.0;
    distanceToHoop = 15.0;
    totalScore = 0;
    accDueToGrav = 9.8;
    shotSwitch = false;
    takeShot = false;   

    takeShotOn(){
        this.takeShot = true;
    }

    takeShotOff(){
        this.takeShot = false;
    }

    shotToggleOn(){
        this.shotSwitch = true;
    }

    shotToggleOff(){
        this.shotSwitch = false;
    }


    accDueToGravIncrease(){
        this.accDueToGrav = this.accDueToGrav + 0.1;
    }

    accDueToGravDecrease(){
        this.accDueToGrav = this.accDueToGrav - 0.1;
    } 

    increaseTotalScore(){
        this.totalScore++;
    }

    distanceToHoopIncrease(){
        this.distanceToHoop = this.distanceToHoop + 0.1;
    }

    distanceToHoopDecrease(){
        this.distanceToHoop = this.distanceToHoop - 0.1;
    }    

    verticalAngleIncrease(){
        this.verticalAngle++;
    }

    verticalAngleDecrease(){
        this.verticalAngle--;
    }

    horizontalAngleIncrease(){
        this.horizontalAngle++;
    }

    horizontalAngleDecrease(){
        this.horizontalAngle--;
    }

    initialVelocityIncrease(){
        this.initialVelocity = this.initialVelocity + 0.1
    }

    initialVelocityDecrease(){
        this.initialVelocity = this.initialVelocity - 0.1;
    }  


    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);



        const t = (program_state.animation_time / 1000) % 5;
        //let dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let velocityZ = (this.initialVelocity*Math.cos(this.verticalAngle*Math.PI*(1/180)))*Math.cos(this.horizontalAngle*Math.PI*(1/180));
        let velocityY = this.initialVelocity*Math.sin(this.verticalAngle*Math.PI*(1/180));
        let velocityX = (this.initialVelocity*Math.cos(this.verticalAngle*Math.PI*(1/180)))*Math.sin(this.horizontalAngle*Math.PI*(1/180));
        const light_position = vec4(0, 0, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 100)];
        let model_transform  = Mat4.identity();
        
        //draw basketball
        let model_transform_basketBall = model_transform.times(Mat4.translation(t*velocityX, Math.max(-0.71, (t*velocityY)-0.5*this.accDueToGrav*t*t), (-1)*t*velocityZ)
            .times(Mat4.scale(0.24, 0.24, 0.24)));

        this.basketBall = model_transform_basketBall;
        model_transform_basketBall = model_transform_basketBall.times(Mat4.rotation(t, 1, 0, 0));
        
        if(this.shotSwitch && t < 0.1){
            this.takeShotOn();
        }

        if(this.takeShot){
           this.shapes.sphere5.draw(context, program_state, model_transform_basketBall, this.materials.basketBall);
        }

        if (t>4.9 && this.takeShot){
            this.shotToggleOff();
            this.takeShotOff();
        }
        // drawing court_floor
        let floor_transform = model_transform.times(Mat4.translation(0,-1.0, -40))
            .times(Mat4.scale(15,.05,45));
        this.shapes.cube.draw(context, program_state, floor_transform , this.materials.backboard_holder.override({color:hex_color("#dda01e")}));
        
        // drawing the base
        let base_transform = model_transform.times(Mat4.translation(0, -0.8, -1*(this.distanceToHoop+1.55))
            .times(Mat4.scale(0.5,0.2,0.5)));
        this.shapes.cube.draw(context, program_state, base_transform , this.materials.backboard.override({color:color(0.5,0.5,0.5,1)}));

        // drawing the post
        let postPieceOne_transform = model_transform.times(Mat4.translation(0, 0, -1*(this.distanceToHoop+1.11)))
            .times(Mat4.scale(0.1,1.0,0.05));
        this.shapes.cube.draw(context, program_state, postPieceOne_transform , this.materials.backboard);
        let postPieceTwo_transform = model_transform.times(Mat4.translation(0, 1.525,-1*(this.distanceToHoop+0.7969)))
            .times(Mat4.rotation(Math.PI/6,1,0,0))
            .times(Mat4.scale(0.1, 0.6062, 0.05));
        this.shapes.cube.draw(context, program_state, postPieceTwo_transform , this.materials.backboard);

        // drawing backboard
        let backboard_transform = model_transform.times(Mat4.translation(0, 2.355, -1*(this.distanceToHoop+0.4938))
            .times(Mat4.scale(0.915, 0.61, 0.1)));
        this.shapes.cube.draw(context, program_state, backboard_transform , this.materials.backboard_holder);
        backboard_transform = backboard_transform.times(Mat4.translation(0,-0.4,0)).times(Mat4.scale(1.1,0.75,0.5));
        this.shapes.cube.draw(context, program_state, backboard_transform , this.materials.backboard);
       
        // drawing the hoop
        let hoop_transform = model_transform;
        hoop_transform = hoop_transform.times(Mat4.translation(0, 2.05, -1*this.distanceToHoop))
            .times(Mat4.rotation(Math.PI,0,1,-1))
            .times(Mat4.scale(0.55,0.55,0.1));
        this.shapes.torus.draw(context, program_state, hoop_transform , this.materials.hoop);
        this.hoopView = model_transform.times(Mat4.translation(0, .5, -1*(this.distanceToHoop+1.1738)).
            times(Mat4.rotation(Math.PI,0,1/2,1)));

        //Detect Scores
        if(this.basketBall == this.hoop_transform){
            increaseTotalScore();
        }


        //camera function
        if(this.attached){
            if (this.attached() == this.initial_camera_location){
                program_state.set_camera(this.initial_camera_location);
            }
            else{
                program_state.set_camera( Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 5))));
            }

        }

    }
}


class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 VERTEX_COLOR;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            
                //for gouraud shading
                vec4 vertexColor = vec4( shape_color.xyz * ambient, shape_color.w );
                vertexColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                VERTEX_COLOR = vertexColor;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                //gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                gl_FragColor = VERTEX_COLOR;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);

        //passing model_transform and project_camera_model_transform to the GPU
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
        // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                
                // calculate the global point coordinates:
                // 1. calculate the center
                center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
                // 2. calculate the point_position
                point_position = model_transform * vec4(position, 1.0);
          
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
        // Compute an initial (ambient) color:
            float ambient = cos(8.5 * length(point_position.xyz-center.xyz));
            gl_FragColor = vec4(1, 0, 0 , 1.0) * ambient;
          
        }`;
    }
}