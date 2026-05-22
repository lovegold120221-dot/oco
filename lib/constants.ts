/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default Live API model to use
 */
export const DEFAULT_LIVE_API_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const DEFAULT_VOICE = 'Aoede';

export const AVAILABLE_VOICES = ['Aoede', 'Puck', 'Charon', 'Fenrir', 'Kore'];

export const VOICE_ALIASES: Record<string, string> = {
  Aoede: 'Wonder Woman (Aoede)',
  Puck: 'Spider-Man (Puck)',
  Charon: 'Batman (Charon)',
  Fenrir: 'Wolverine (Fenrir)',
  Kore: 'Black Widow (Kore)',
};
