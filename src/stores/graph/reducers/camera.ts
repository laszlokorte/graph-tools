const softClamp = (val, newVal, min, max) => {
    if(newVal > max && val > max) {
        return Math.min(newVal, val);
    } else if(newVal < min && val < min) {
        return Math.max(newVal, val);
    } else {
        return Math.min(Math.max(min, newVal), max);
    }
}

const initilState = {
        center: {x: 0, y:0},
        rotation: 0,
        zoom: 1,
        panX: null,
        panY: null,
        screen: {
            width: 0,
            height: 0,
        },
        box: {
            minX: -Infinity,
            minY: -Infinity,
            maxX: Infinity,
            maxY: Infinity,
        }
    }

export default function cameraReducer(camera = initilState, box, action)  {
    const defaultZoom = Math.min(
      camera.screen.width/(box.maxX - box.minX),
      camera.screen.height/(box.maxY - box.minY),
      20
    )
    switch(action.type) {
        case 'CAMERA_UPDATE_SCREEN':
            return {
                ...camera,
                box,
                screen: {
                    width: action.screen.width,
                    height: action.screen.height,
                }
            };
        case 'CAMERA_ZOOM':
            const minZoom = Math.min(
              camera.screen.width / (box.maxX - box.minX),
              camera.screen.height / (box.maxY - box.minY),
              0.8
            )
            const newZoom = softClamp(camera.zoom, camera.zoom * action.factor, minZoom, 6)
            const realFactor = newZoom / camera.zoom;
            const panFactor = 1 - 1 / realFactor;

            const newX = softClamp(camera.center.x, camera.center.x + (action.x - camera.center.x) * panFactor, box.minX, box.maxX)
            const newY = softClamp(camera.center.y, camera.center.y + (action.y - camera.center.y) * panFactor, box.minY, box.maxY)

            return {
                ...camera,
                box,
                zoom: newZoom,
                center: {
                    ...camera.center,
                    x: newX,
                    y: newY,
                },
            };
        case 'CAMERA_ROTATE':
            const deltaAngle = action.deltaAngle;
            const dx = camera.center.x - action.x;
            const dy = camera.center.y - action.y;
            const rad = Math.PI * deltaAngle / 180;
            const sin = Math.sin(-rad)
            const cos = Math.cos(-rad)

            return {
              ...camera,
                box,
                center: {
                    ...camera.center,
                    x: action.x + cos * dx - sin * dy, //softClamp(camera.center.x, , box.minX, box.maxX),
                    y: action.y + sin * dx + cos * dy, //softClamp(camera.center.y, , box.minY, box.maxY),
                },
                rotation: (camera.rotation + deltaAngle) % 360,
            };
        case 'CAMERA_PAN': {
            const sin = Math.sin(camera.rotation * Math.PI / 180)
            const cos = Math.cos(camera.rotation * Math.PI / 180)
            const dx = (cos * action.deltaX + sin * action.deltaY)  / camera.zoom
            const dy = (-sin * action.deltaX + cos * action.deltaY) / camera.zoom
            return {
                ...camera,
                box,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x + dx, box.minX, box.maxX),
                    y: softClamp(camera.center.y, camera.center.y + dy, box.minY, box.maxY),
                },
            }
        }
        case 'CAMERA_RESET':
            return {
                ...camera,
                box,
                center: {
                    ...camera.center,
                    x: (box.minX + box.maxX) / 2,
                    y: (box.minY + box.maxY) / 2,
                },
                rotation: 0,
                zoom: defaultZoom,
            }
        case 'CAMERA_START_PAN':
            return {
                ...camera,
                box,
                panX: action.x,
                panY: action.y,
            }
        case 'CAMERA_STOP_PAN':
            return {
                ...camera,
                box,
                panX: null,
                panY: null,
            }
        case 'CAMERA_MOVE_PAN':
            if(camera.panX === null || camera.panY === null) {
                return camera;
            }
            const deltaX = action.x - camera.panX;
            const deltaY = action.y - camera.panY;
            return {
                ...camera,
                box,
                center: {
                    ...camera.center,
                    x: softClamp(camera.center.x, camera.center.x - deltaX, box.minX, box.maxX),
                    y: softClamp(camera.center.y, camera.center.y - deltaY, box.minY, box.maxY),
                },
            }

    }

    return camera.box === box ? camera : {
        ...camera,
        box,
    };
}
