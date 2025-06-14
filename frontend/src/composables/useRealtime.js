import { ref } from "vue";
import { fetchEphemeralSession } from "../lib/api.js";
import { handleUiEvent } from "./useUiStore.js";

/**
 * Tiny wrapper around the WebRTC connection flow described in the OpenAI docs.
 * It exposes a handful of reactive refs that components can bind to.
 */
export function useRealtime() {
  const status = ref("idle"); // idle | connecting | live | error
  const messages = ref([]); // raw events from data-channel
  const pcRef = ref(null);
  const dcRef = ref(null);

  async function connect({ voice } = {}) {
    try {
      status.value = "connecting";

      // 1) Fetch an ephemeral key + session params from our backend.
      const session = await fetchEphemeralSession({ voice });
      const EPHEMERAL_KEY = session.client_secret.value;

      // 2) Create peer connection & data channel.
      const pc = new RTCPeerConnection();
      pcRef.value = pc;

      // Forward remote audio to <audio> element – we create one lazily.
      pc.ontrack = (e) => {
        let el = document.querySelector("#remote-audio");
        if (!el) {
          el = document.createElement("audio");
          el.id = "remote-audio";
          el.autoplay = true;
          document.body.appendChild(el);
        }
        el.srcObject = e.streams[0];
      };

      // Local microphone.
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(ms.getTracks()[0]);

      // Data channel for events.
      const dc = pc.createDataChannel("oai-events");
      dcRef.value = dc;
      dc.addEventListener("message", async (e) => {
        // Debug log raw data-channel message (disabled)
        // console.log("[RTC_EVENT_RAW]", e.data);
        let parsed;
        try {
          parsed = JSON.parse(e.data);
          messages.value.push(parsed);
          // Parsed event (disabled)
          // console.log('[RTC_PARSED]', parsed);
        } catch (_) {
          messages.value.push(e.data);
          return;
        }
        // Detect completed function_call events from the Realtime API
        // Support both legacy 'function_call' and the newer 'response.function_call_arguments.done'
        const isFunctionDone = (parsed.type === 'function_call')
          || (parsed.type === 'response.function_call_arguments.done');
        if (isFunctionDone && parsed.name && parsed.arguments) {
          // Log only function call events
          console.log('[RTC_FUNCTION_CALL]', parsed.name, parsed.arguments);
          // Parse arguments if they arrive as a JSON string
          let funcArgs = parsed.arguments;
          if (typeof funcArgs === 'string') {
            try {
              funcArgs = JSON.parse(funcArgs);
            } catch (parseErr) {
              console.error('Invalid function arguments JSON:', funcArgs);
              return;
            }
          }
          // -------------------------------------------------------------------
          // V0 implementation – handle *add_to_ui* completely on the client and
          // skip the backend call (avoids auth errors during prototyping).
          // -------------------------------------------------------------------

          if (parsed.name === 'add_to_ui') {
            const { type, custom_data } = funcArgs;
            console.log('[UI_EVENT]', type, custom_data);

            // Update reactive UI store so App.vue can render the card list.
            handleUiEvent(type, custom_data);

            // Optional spoken confirmation via assistant message
            if (dcRef.value) {
              let summaryText;
              if (type === 'card.create' && custom_data?.title) {
                summaryText = `Added card “${custom_data.title}.”`;
              } else if (type === 'card.update' && custom_data?.title) {
                summaryText = `Updated card “${custom_data.title}.”`;
              }
              if (summaryText) {
                dcRef.value.send(
                  JSON.stringify({
                    type: 'conversation.item.create',
                    item: {
                      type: 'message',
                      role: 'assistant',
                      content: [{ type: 'text', text: summaryText }],
                    },
                  }),
                );
              }
            }

            // TODO: push event into a reactive UI store for rendering.
            return; // Stop here – no backend round-trip needed.
          }

          // -------------------------------------------------------------------
          // For any future non-UI function calls we may forward them to the
          // backend (requires valid auth token).  Disabled for now.
          // -------------------------------------------------------------------

          /*
          try {
            const res = await apiFetch("/realtime/function-call", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: parsed.name, arguments: funcArgs }),
            });
            const json = await res.json();
            console.log("[FunctionCall] executed:", parsed.name, json);
          } catch (err) {
            console.error("Failed to execute/log function call:", err);
          }
          */
        }
      });

      // 3) SDP handshake.
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2025-06-03";

      const sdpRes = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpRes.ok) throw new Error("Failed to exchange SDP with OpenAI");

      const answer = { type: "answer", sdp: await sdpRes.text() };
      await pc.setRemoteDescription(answer);

      status.value = "live";
    } catch (err) {
      console.error(err);
      status.value = "error";
    }
  }

  function disconnect() {
    if (pcRef.value) {
      pcRef.value.close();
    }
    status.value = "idle";
  }

  return { status, messages, connect, disconnect };
}
