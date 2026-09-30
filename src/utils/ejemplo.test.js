import { describe, it, expect } from "vitest";
import { sumar } from './ejemplo.js';

describe('sumar', () => {
    it('suma dos numeros', () => {
        expect(sumar(2,3)).toBe(5);
    })
})