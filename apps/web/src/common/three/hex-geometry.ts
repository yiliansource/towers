import * as THREE from "three";

export function getHexVertices(): THREE.Vector2[] {
    return [...Array(6).keys()].map((i) => {
        const theta = ((i + 0.5) / 6) * Math.PI * 2;
        return new THREE.Vector2(Math.cos(theta), Math.sin(theta));
    });
}

export function createHexGeometry() {
    const shape = new THREE.Shape();
    const points = getHexVertices();

    shape.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => void shape.lineTo(p.x, p.y));
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    return geo;
}
