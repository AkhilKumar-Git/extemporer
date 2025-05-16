'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer, { ReactPlayerProps } from 'react-player/lazy';
import { Box, IconButton, Typography, Slider, Grid, CircularProgress, SxProps, Theme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';

interface CustomReactPlayerProps {
  url: string;
  poster?: string;
  onEnded?: () => void;
  initialDuration?: number;
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === Infinity) {
    return '00:00';
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const controlIconSize: SxProps<Theme> = {
  fontSize: { xs: '20px', sm: '24px', md: '28px' }
};

const timeTypographyVariant = { xs: 'caption', sm: 'body2' } as const;


export default function CustomReactPlayer({ url, poster, onEnded, initialDuration }: CustomReactPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0); // Progress from 0 to 1
  const [loaded, setLoaded] = useState(0); // Buffered progress
  const [duration, setDuration] = useState<number>(initialDuration && isFinite(initialDuration) && initialDuration > 0 ? initialDuration : 0);
  const [seeking, setSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true); // Initially show controls
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reactPlayerReportedDuration, setReactPlayerReportedDuration] = useState<number | null>(null);
  const [isInDirectSeekMode, setIsInDirectSeekMode] = useState(false);

  let controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (initialDuration && isFinite(initialDuration) && initialDuration > 0 && duration !== initialDuration) {
        console.log('[CustomReactPlayer] Setting duration from initialDuration prop:', initialDuration);
        setDuration(initialDuration);
    }
  }, [initialDuration]);

  useEffect(() => {
    const shouldBeInDirectMode =
      reactPlayerReportedDuration !== null &&
      !isFinite(reactPlayerReportedDuration) &&
      isFinite(duration) &&
      duration > 0;
    if (shouldBeInDirectMode !== isInDirectSeekMode) {
      console.log(`[CustomReactPlayer] isInDirectSeekMode changing to: ${shouldBeInDirectMode}. ReactPlayer duration: ${reactPlayerReportedDuration}, Component duration: ${duration}`);
      setIsInDirectSeekMode(shouldBeInDirectMode);
    }
  }, [reactPlayerReportedDuration, duration, isInDirectSeekMode]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    setMuted(false); // Unmute when volume is changed by slider
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
    if (muted && volume === 0) { // If unmuting and volume was 0, set to a default
        setVolume(0.5);
    }
  };
  
  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      if (isInDirectSeekMode) {
        const internalPlayer = playerRef.current?.getInternalPlayer() as HTMLVideoElement | undefined;
        if (internalPlayer && isFinite(duration) && duration > 0) {
          const currentTime = internalPlayer.currentTime;
          let currentFraction = currentTime / duration;
          // Clamp fraction between 0 and 1, and ensure it's finite
          currentFraction = Math.min(1, Math.max(0, isFinite(currentFraction) ? currentFraction : 0));
          // console.log(`[CustomReactPlayer] DirectSeekMode Progress: currentTime=${currentTime}, duration=${duration}, newPlayed=${currentFraction}`);
          setPlayed(currentFraction);
        } else {
          // Potentially do nothing or log if conditions for manual update aren't met
          // console.warn("[CustomReactPlayer] DirectSeekMode Progress: conditions not met for manual update.");
        }
      } else {
        // Normal operation, trust ReactPlayer's played fraction
        setPlayed(state.played);
      }
    }
    setLoaded(state.loaded); // Always update loaded from ReactPlayer

    if (state.playedSeconds > 0 && isBuffering) {
        setIsBuffering(false);
    }
  };

  const handleDuration = (newDurationFromPlayer: number) => {
    console.log('[CustomReactPlayer] Video duration received from ReactPlayer:', newDurationFromPlayer);
    setReactPlayerReportedDuration(newDurationFromPlayer); // Store what ReactPlayer reports

    if (isFinite(newDurationFromPlayer) && newDurationFromPlayer > 0) {
        if (!initialDuration || Math.abs(newDurationFromPlayer - initialDuration) > 1 || duration === 0) {
             console.log('[CustomReactPlayer] Updating duration state with ReactPlayer value:', newDurationFromPlayer);
             setDuration(newDurationFromPlayer);
        }
    } else if (duration === 0 && initialDuration && isFinite(initialDuration) && initialDuration > 0) {
        console.log('[CustomReactPlayer] ReactPlayer reported non-finite duration, keeping initialDuration from prop:', initialDuration);
        setDuration(initialDuration);
    } else if (duration === 0 && (!initialDuration || initialDuration <= 0)) {
        console.warn('[CustomReactPlayer] Both initialDuration and ReactPlayer duration are invalid.');
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (event: Event, newValue: number | number[]) => {
    setPlayed(newValue as number);
  };

  const handleSeekMouseUp = (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    setSeeking(false);
    const newFraction = newValue as number;
    if (playerRef.current && isFinite(newFraction)) {
      const internalPlayerActualDuration = playerRef.current.getDuration();
      if (internalPlayerActualDuration !== null && !isFinite(internalPlayerActualDuration)) {
        console.warn(`[CustomReactPlayer] handleSeekMouseUp: ReactPlayer's internal duration is non-finite (${internalPlayerActualDuration}). Timer-based duration: ${duration}, Fraction: ${newFraction}. Attempting direct currentTime set.`);
        if (isFinite(duration) && duration > 0) {
            const seekToSeconds = newFraction * duration;
            const internalPlayer = playerRef.current?.getInternalPlayer() as HTMLVideoElement | undefined;
            if (internalPlayer && typeof internalPlayer.currentTime === 'number' && isFinite(seekToSeconds)) {
                try {
                    console.log(`[CustomReactPlayer] Attempting to set internalPlayer.currentTime = ${seekToSeconds} (handleSeekMouseUp)`);
                    internalPlayer.currentTime = seekToSeconds;
                    setPlayed(newFraction); // Update UI to reflect attempted seek
                } catch (e) {
                    console.error("[CustomReactPlayer] Error setting currentTime directly (handleSeekMouseUp):", e);
                }
            } else {
                 console.warn("[CustomReactPlayer] Cannot set currentTime directly (handleSeekMouseUp). Conditions: internalPlayer available?", !!internalPlayer, "isFinite(seekToSeconds)?", isFinite(seekToSeconds), "seekToSeconds:", seekToSeconds);
            }
        } else {
            console.warn("[CustomReactPlayer] Cannot attempt direct currentTime set (handleSeekMouseUp) due to invalid component duration or fraction.");
        }
        return; // Prevent falling through to ReactPlayer.seekTo()
      }

      // This part is now only reached if internalPlayerActualDuration IS finite.
      if (isFinite(duration) && duration > 0) {
        const seekToSeconds = newFraction * duration;
        console.log(`[CustomReactPlayer] handleSeekMouseUp: Seeking to ${seekToSeconds} seconds (fraction: ${newFraction}, timer-duration: ${duration}, internalPlayerActualDuration: ${internalPlayerActualDuration})`);
        playerRef.current.seekTo(seekToSeconds, 'seconds');
      } else {
        console.warn('[CustomReactPlayer] Seek aborted in handleSeekMouseUp due to invalid component duration state. Fraction:', newFraction, 'Component Duration state:', duration, 'Internal Player Duration:', internalPlayerActualDuration);
      }
    } else {
      console.warn('[CustomReactPlayer] Seek aborted in handleSeekMouseUp due to playerRef not current or non-finite fraction. Fraction:', newFraction);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onEnded) onEnded();
  };

  const handleBuffer = () => {
    setIsBuffering(true);
  };

  const handleBufferEnd = () => {
    setIsBuffering(false);
  };
  
  const handleSeekBackward = () => {
    if (playerRef.current && isFinite(duration) && duration > 0) {
      const internalPlayerActualDuration = playerRef.current.getDuration();
      const currentPlayedFraction = played; // Current fraction from state
      const targetSeekSeconds = Math.max(0, (currentPlayedFraction * duration) - 10);

      if (internalPlayerActualDuration !== null && !isFinite(internalPlayerActualDuration)) {
        console.warn(`[CustomReactPlayer] handleSeekBackward: ReactPlayer's internal duration is non-finite (${internalPlayerActualDuration}). Timer-based duration: ${duration}. Attempting direct currentTime set to ${targetSeekSeconds}s.`);
        const internalPlayer = playerRef.current?.getInternalPlayer() as HTMLVideoElement | undefined;
        if (internalPlayer && typeof internalPlayer.currentTime === 'number' && isFinite(targetSeekSeconds)) {
            try {
                console.log(`[CustomReactPlayer] Attempting to set internalPlayer.currentTime = ${targetSeekSeconds} (handleSeekBackward)`);
                internalPlayer.currentTime = targetSeekSeconds;
                setPlayed(targetSeekSeconds / duration); // Update UI
            } catch (e) {
                console.error("[CustomReactPlayer] Error setting currentTime directly (handleSeekBackward):", e);
            }
        } else {
            console.warn("[CustomReactPlayer] Cannot set currentTime directly (handleSeekBackward). Conditions: internalPlayer available?", !!internalPlayer, "isFinite(targetSeekSeconds)?", isFinite(targetSeekSeconds));
        }
        return; // Prevent falling through
      }
      
      // This part is only reached if internalPlayerActualDuration IS finite.
      console.log(`[CustomReactPlayer] handleSeekBackward: Seeking to ${targetSeekSeconds} seconds via ReactPlayer.seekTo. (currentPlayed: ${currentPlayedFraction}, timer-duration: ${duration}, internalPlayerActualDuration: ${internalPlayerActualDuration})`);
      playerRef.current.seekTo(targetSeekSeconds, 'seconds');
      setPlayed(targetSeekSeconds / duration); 
    } else {
      console.warn('[CustomReactPlayer] Seek backward aborted. Component Duration state:', duration);
    }
  };

  const handleSeekForward = () => {
    if (playerRef.current && isFinite(duration) && duration > 0) {
      const internalPlayerActualDuration = playerRef.current.getDuration();
      const currentPlayedFraction = played; // Current fraction from state
      const targetSeekSeconds = Math.min(duration, (currentPlayedFraction * duration) + 10);

      if (internalPlayerActualDuration !== null && !isFinite(internalPlayerActualDuration)) {
        console.warn(`[CustomReactPlayer] handleSeekForward: ReactPlayer's internal duration is non-finite (${internalPlayerActualDuration}). Timer-based duration: ${duration}. Attempting direct currentTime set to ${targetSeekSeconds}s.`);
        const internalPlayer = playerRef.current?.getInternalPlayer() as HTMLVideoElement | undefined;
        if (internalPlayer && typeof internalPlayer.currentTime === 'number' && isFinite(targetSeekSeconds)) {
            try {
                console.log(`[CustomReactPlayer] Attempting to set internalPlayer.currentTime = ${targetSeekSeconds} (handleSeekForward)`);
                internalPlayer.currentTime = targetSeekSeconds;
                setPlayed(targetSeekSeconds / duration); // Update UI
            } catch (e) {
                console.error("[CustomReactPlayer] Error setting currentTime directly (handleSeekForward):", e);
            }
        } else {
            console.warn("[CustomReactPlayer] Cannot set currentTime directly (handleSeekForward). Conditions: internalPlayer available?", !!internalPlayer, "isFinite(targetSeekSeconds)?", isFinite(targetSeekSeconds));
        }
        return; // Prevent falling through
      }

      // This part is only reached if internalPlayerActualDuration IS finite.
      console.log(`[CustomReactPlayer] handleSeekForward: Seeking to ${targetSeekSeconds} seconds via ReactPlayer.seekTo. (currentPlayed: ${currentPlayedFraction}, timer-duration: ${duration}, internalPlayerActualDuration: ${internalPlayerActualDuration})`);
      playerRef.current.seekTo(targetSeekSeconds, 'seconds');
      setPlayed(targetSeekSeconds / duration); 
    } else {
      console.warn('[CustomReactPlayer] Seek forward aborted. Component Duration state:', duration);
    }
  };
  
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && playerContainerRef.current) {
        playerContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  const hideControls = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (playing) { // Only hide if playing
        setShowControls(false);
      }
    }, 3000); // Hide after 3 seconds of inactivity
  };

  const displayControls = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    if (playing) { // If playing, set timeout to hide again
        hideControls();
    }
  };

  useEffect(() => {
    if (playing) {
      hideControls(); // Start timer when playing starts
    } else {
      displayControls(); // Show controls when paused
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current); // Clear hide timer
      }
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [playing]);


  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', aspectRatio: '16/9', backgroundColor: 'black' }}>
        <CircularProgress color="inherit" sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box 
        ref={playerContainerRef}
        sx={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '16/9', // Maintain aspect ratio
            backgroundColor: 'black',
            overflow: 'hidden', // Ensures controls don't spill out
        }}
        onMouseMove={displayControls}
        onMouseLeave={() => { if (playing) hideControls();}} // Hide when mouse leaves and playing
        onClick={() => { // Allow click on video to play/pause only if controls are visible
            if (showControls) handlePlayPause();
        }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onPlay={() => { setPlaying(true); setIsBuffering(false); }}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        config={{
          file: {
            attributes: {
              ...(poster && { poster: poster }), // Conditionally add poster
              preload: 'auto',
              controlsList: 'nodownload noremoteplayback noplaybackrate', // Hide default HTML5 controls more aggressively
            },
          },
        }}
      />

      {isBuffering && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2, // Above player, below controls
        }}>
          <CircularProgress color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.7)'}} />
        </Box>
      )}

      {/* Custom Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 1, sm: 1.5, md: 2 },
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          zIndex: 3, // Above everything
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          // Prevent click-through to player when controls are shown
          pointerEvents: showControls ? 'auto' : 'none',
        }}
        onClick={(e) => e.stopPropagation()} // Stop click propagation to video element
      >
        {/* Progress Bar */}
        <Slider
          aria-label="seek"
          size="small"
          value={played}
          min={0}
          step={0.0001} // Finer steps for smoother seeking
          max={1}
          onMouseDown={handleSeekMouseDown}
          onChange={handleSeekChange}
          onChangeCommitted={handleSeekMouseUp} // Use onChangeCommitted for final seek value
          sx={{
            color: 'primary.main', // Or any color you prefer
            mb: { xs: -0.5, sm: 0 }, // Adjust margin for spacing
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
            '& .MuiSlider-track': {
              border: 'none',
              backgroundColor: 'primary.main', // Or your primary color
            },
            '& .MuiSlider-thumb': {
              width: { xs: 10, sm: 12 },
              height: { xs: 10, sm: 12 },
              backgroundColor: 'primary.main', // Or your primary color
              '&:before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.16)`,
              },
              '&.Mui-active': {
                boxShadow: `0px 0px 0px 14px rgba(var(--mui-palette-primary-mainChannel) / 0.16)`,
              },
            },
            // Loaded part of the progress bar
            '& .MuiSlider-rail::after': loaded > 0 ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '100%', // same height as rail
                width: `${loaded * 100}%`,
                backgroundColor: 'rgba(255,255,255,0.5)', // Color for loaded part
                zIndex: -1, // Behind the track
            } : {},
          }}
        />

        {/* Controls Row */}
        <Grid container alignItems="center" justifyContent="space-between" spacing={{ xs: 0.5, sm: 1 }}>
          {/* Left Controls */}
          <Grid item xs={true} sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePlayPause} color="inherit" aria-label={playing ? 'pause' : 'play'}>
              {playing ? <PauseIcon sx={controlIconSize} /> : <PlayArrowIcon sx={controlIconSize} />}
            </IconButton>
            <IconButton onClick={handleSeekBackward} color="inherit" aria-label="replay 10 seconds">
                <Replay10Icon sx={controlIconSize} />
            </IconButton>
            <IconButton onClick={handleSeekForward} color="inherit" aria-label="forward 10 seconds">
                <Forward10Icon sx={controlIconSize} />
            </IconButton>
            <IconButton onClick={handleMuteToggle} color="inherit" aria-label={muted ? 'unmute' : 'mute'}>
              {muted ? <VolumeOffIcon sx={controlIconSize} /> : volume > 0.5 ? <VolumeUpIcon sx={controlIconSize} /> : <VolumeDownIcon sx={controlIconSize} />}
            </IconButton>
            <Slider
              aria-label="volume"
              value={muted ? 0 : volume}
              min={0}
              step={0.05}
              max={1}
              onChange={handleVolumeChange}
              sx={{ 
                width: { xs: 60, sm: 80, md: 100 }, 
                ml: { xs: 0.5, sm: 1 }, 
                color: 'inherit',
                '& .MuiSlider-thumb': {
                    width: { xs: 10, sm: 12 },
                    height: { xs: 10, sm: 12 },
                }
            }}
            />
            <Typography variant="body2" sx={{ ml: { xs: 1, sm: 1.5 }, minWidth: '40px' }}>
              {formatTime(played * duration)}
            </Typography>
            <Typography variant="body2" sx={{ mx: 0.5 }}>/</Typography>
            <Typography variant="body2" sx={{ minWidth: '40px' }}>
              {formatTime(duration)}
            </Typography>
          </Grid>

          {/* Right Controls */}
          <Grid item xs={true} sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Playback Speed - Basic example, can be improved with a Popover/Menu */}
            {/* <Button onClick={() => handlePlaybackRateChange(playbackRate === 1 ? 1.5 : 1)} color="inherit" sx={{ typography: timeTypographyVariant, textTransform: 'lowercase' }}>
              {playbackRate}x
            </Button> */}
            <IconButton onClick={handleToggleFullscreen} color="inherit" aria-label={isFullscreen ? "exit fullscreen" : "fullscreen"}>
              {isFullscreen ? <FullscreenExitIcon sx={controlIconSize} /> : <FullscreenIcon sx={controlIconSize} />}
            </IconButton>
            {/* ReactPlayer's PiP is controlled by its own button if 'pip' prop is true and supported */}
            {/* For custom PiP button, you might need more direct player control if ReactPlayer doesn't expose it easily */}
            {playerRef.current?.props.pip && (
                 <IconButton 
                    onClick={() => playerRef.current?.getInternalPlayer()?.requestPictureInPicture?.()} 
                    color="inherit" 
                    aria-label="picture in picture"
                    // disabled={!playerRef.current?.getInternalPlayer()?.requestPictureInPicture} // check if API available
                  >
                    <PictureInPictureAltIcon sx={controlIconSize} />
                </IconButton>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 