import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthenticatedImageProps {
  source: string;
  style?: any;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export function AuthenticatedImage({ 
  source, 
  style, 
  className, 
  resizeMode = 'cover',
  fallback,
  onLoad,
  onError 
}: AuthenticatedImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [source]);

  const loadImage = async () => {
    if (!source) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Get auth token
      const token = await AsyncStorage.getItem('@staffsync_auth_token');
      
      // For public images or absolute URLs, use directly
      if (source.startsWith('http') && !source.includes('dev.staffsynctech.co.uk')) {
        setImageUrl(source);
        setLoading(false);
        return;
      }

      // For backend-relative URLs, fetch with auth and create blob URL
      if (source.startsWith('http')) {
        const response = await fetch(source, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'X-API-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setImageUrl(blobUrl);
          
          // Clean up blob URL when component unmounts
          return () => URL.revokeObjectURL(blobUrl);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      setError(true);
      setLoading(false);
    } catch (err) {
      console.error('AuthenticatedImage Error:', err);
      setError(true);
      setLoading(false);
      onError?.(err);
    }
  };

  if (loading) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]} className={className}>
        <ActivityIndicator size="small" color="#9CA3AF" />
      </View>
    );
  }

  if (error || !imageUrl) {
    return fallback || <View style={style} className={className} />;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      className={className}
      resizeMode={resizeMode}
      onLoad={() => {
        setLoading(false);
        onLoad?.();
      }}
      onError={(err) => {
        console.error('AuthenticatedImage Load Error:', err);
        setError(true);
        onError?.(err);
      }}
    />
  );
}
