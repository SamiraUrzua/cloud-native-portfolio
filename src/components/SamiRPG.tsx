'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig, GAME_WIDTH, GAME_HEIGHT } from '@/game/config';

export default function SamiRPG() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current || !containerRef.current) return;

        const game = new Phaser.Game(createGameConfig(containerRef.current));

        gameRef.current = game;

        return () => {
            game.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        />
    );
}