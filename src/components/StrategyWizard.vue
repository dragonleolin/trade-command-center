<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 transition-all duration-300 backdrop-blur-sm">
    <div class="pixel-card bg-gray-900 w-full max-w-4xl h-[85vh] flex flex-col relative shadow-2xl border-4 border-gray-600">
      
      <!-- Top Bar decoration -->
      <div class="h-2 bg-gradient-to-r from-neon-pink via-purple-500 to-neon-blue w-full"></div>

      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl transition-transform hover:scale-110 z-10">✖</button>

      <!-- Main Content Area -->
      <div class="flex flex-col md:flex-row h-full overflow-hidden">
        
        <!-- Left Panel: Character & Dialogue (Always Visible) -->
        <div class="md:w-1/3 p-6 bg-black border-r border-gray-700 flex flex-col items-center justify-start relative overflow-hidden">
            <!-- Background Grid Effect -->
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <div class="relative z-10 w-full flex flex-col items-center">
                <div class="w-32 h-32 md:w-48 md:h-48 mb-6 border-4 border-white shadow-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img :src="avatarUrl" alt="Advisor" class="w-full h-full object-cover pixelated hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div class="w-full bg-gray-800 border-2 border-white p-4 rounded-lg shadow-inner relative">
                    <div class="absolute -top-3 left-4 bg-neon-green text-black text-xs font-bold px-2 py-0.5">ADVISOR</div>
                    <p class="text-neon-green text-lg leading-relaxed typing-container min-h-[4rem]">
                        {{ currentQuestion }}
                    </p>
                </div>

                <!-- Progress Indicators -->
                <div class="mt-8 flex gap-2">
                    <div v-for="i in 6" :key="i" 
                         class="w-3 h-3 border border-gray-500 transition-colors duration-300"
                         :class="step >= i ? 'bg-neon-pink shadow-[0_0_5px_#ff00ff]' : 'bg-transparent'">
                    </div>
                </div>
                <div class="text-gray-500 text-xs mt-2 font-mono">STEP {{ step }} / 6</div>
            </div>
        </div>

        <!-- Right Panel: Inputs (Scrollable) -->
        <div class="md:w-2/3 flex flex-col bg-gray-900 bg-opacity-95">
            <div class="flex-grow p-8 overflow-y-auto custom-scrollbar">
                
                <h2 class="text-2xl text-white mb-6 font-bold border-b border-gray-700 pb-2 flex items-center gap-2">
                    <span class="text-neon-yellow">▶</span> {{ getStepTitle(step) }}
                </h2>

                <transition name="fade" mode="out-in">
                    <div :key="step" class="space-y-6">
                        
                        <!-- Step 1: Identity -->
                        <div v-if="step === 1" class="space-y-6">
                            <div class="group">
                                <label class="block text-gray-400 text-sm mb-2 group-focus-within:text-neon-blue transition-colors">代號 (TICKER)</label>
                                <input v-model="form.code" class="pixel-input-lg w-full font-mono text-2xl tracking-wider" placeholder="e.g. 2330" autofocus />
                            </div>
                            <div class="group">
                                <label class="block text-neon-yellow text-sm mb-2 font-bold group-focus-within:text-white transition-colors">⚡ 商品名稱 (NAME)</label>
                                <input v-model="form.name" class="pixel-input-lg w-full text-xl" placeholder="輸入名稱..." />
                            </div>
                        </div>

                        <!-- Step 2: Status -->
                        <div v-if="step === 2" class="grid grid-cols-1 gap-6">
                             <div class="group">
                                <label class="block text-gray-400 text-sm mb-2">目前持倉 (HOLDINGS)</label>
                                <input v-model="form.holdings" type="number" class="pixel-input-lg w-full font-mono text-neon-blue" />
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-neon-yellow text-sm mb-2 font-bold">💰 平均成本</label>
                                    <input v-model="form.cost" type="number" class="pixel-input-lg w-full font-mono text-xl" />
                                </div>
                                <div>
                                    <label class="block text-gray-400 text-sm mb-2">現價 (PRICE)</label>
                                    <input v-model="form.currentPrice" type="number" class="pixel-input-lg w-full font-mono" />
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Defense -->
                        <div v-if="step === 3" class="space-y-8">
                             <div class="group">
                                <label class="block text-yellow-500 text-sm mb-2">⚠️ 警戒價 (WARNING)</label>
                                <input v-model="form.warning" type="number" class="pixel-input-lg w-full font-mono text-yellow-400 border-yellow-800 focus:border-yellow-500" />
                            </div>
                            <div class="group">
                                <label class="block text-red-500 text-sm mb-2 font-bold text-lg">🛡️ 硬停損價 (STOP LOSS)</label>
                                <div class="relative">
                                    <input v-model="form.stopLoss" type="number" class="pixel-input-lg w-full font-mono text-3xl text-red-500 border-red-800 focus:border-red-500 pl-4 border-l-8" placeholder="0.00" />
                                    <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-900 text-sm">CRITICAL</div>
                                </div>
                                <p class="text-gray-500 text-xs mt-2">* 觸及此價格必須無條件執行撤退</p>
                            </div>
                        </div>

                        <!-- Step 4: Attack -->
                        <div v-if="step === 4" class="space-y-6">
                            <div class="group">
                                <label class="block text-blue-400 text-sm mb-2">🔭 觀察加碼 (ADD)</label>
                                <input v-model="form.addPoint" type="number" class="pixel-input-lg w-full font-mono text-blue-400" />
                            </div>
                            
                            <div class="p-4 border border-green-900 bg-green-900 bg-opacity-10 rounded-lg space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-green-400 text-sm mb-2">停利區間 1 (TP1)</label>
                                        <input v-model="form.tp1" type="number" class="pixel-input-lg w-full font-mono text-green-400 bg-black" />
                                    </div>
                                    <div>
                                        <label class="block text-green-400 text-sm mb-2">停利區間 2 (TP2)</label>
                                        <input v-model="form.tp2" type="number" class="pixel-input-lg w-full font-mono text-green-400 bg-black" />
                                    </div>
                                </div>
                                <div class="pt-2 border-t border-green-800">
                                    <label class="block text-purple-400 text-sm mb-2 font-bold text-lg">🔥 最終目標價 (TARGET)</label>
                                    <input v-model="form.targetPrice" type="number" class="pixel-input-lg w-full font-mono text-3xl text-purple-400 bg-black border-purple-900 focus:border-purple-500" placeholder="MOON" />
                                </div>
                            </div>
                        </div>

                        <!-- Step 5: Risk & Analysis -->
                        <div v-if="step === 5" class="space-y-6">
                            <div>
                                <label class="block text-gray-400 text-sm mb-2">風險等級 (RISK LEVEL)</label>
                                <div class="grid grid-cols-3 gap-4">
                                    <button @click="form.risk = '低'" class="p-4 border-2 text-center transition-all hover:scale-105" :class="form.risk === '低' ? 'border-green-500 bg-green-900 text-white shadow-[0_0_10px_#00ff00]' : 'border-gray-700 text-gray-500'">
                                        <div class="text-2xl mb-1">🛡️</div>
                                        <div class="font-bold">LOW</div>
                                    </button>
                                    <button @click="form.risk = '中'" class="p-4 border-2 text-center transition-all hover:scale-105" :class="form.risk === '中' ? 'border-yellow-500 bg-yellow-900 text-white shadow-[0_0_10px_#ffff00]' : 'border-gray-700 text-gray-500'">
                                        <div class="text-2xl mb-1">⚔️</div>
                                        <div class="font-bold">MID</div>
                                    </button>
                                    <button @click="form.risk = '高'" class="p-4 border-2 text-center transition-all hover:scale-105" :class="form.risk === '高' ? 'border-red-500 bg-red-900 text-white shadow-[0_0_10px_#ff0000]' : 'border-gray-700 text-gray-500'">
                                        <div class="text-2xl mb-1">💀</div>
                                        <div class="font-bold">HIGH</div>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="group flex-grow">
                                <label class="block text-neon-yellow text-sm mb-2 font-bold">🧠 操作建議 (ANALYSIS)</label>
                                <textarea v-model="form.advice" class="pixel-input-lg w-full h-40 text-lg leading-relaxed resize-none p-4" placeholder="記錄你的分析邏輯..."></textarea>
                            </div>
                        </div>

                        <!-- Step 6: Finalize -->
                        <div v-if="step === 6" class="h-full flex flex-col space-y-6">
                            <div>
                                <label class="block text-gray-400 text-sm mb-2">策略屬性 (STRATEGY TYPE)</label>
                                <select v-model="form.strategy" class="pixel-input-lg w-full text-white text-xl p-3 cursor-pointer">
                                    <option>長期持有</option>
                                    <option>波段操作</option>
                                    <option>短線投機</option>
                                    <option>存股</option>
                                </select>
                            </div>
                             <div class="flex-grow group">
                                <label class="block text-gray-500 text-sm mb-2">備註 (NOTES)</label>
                                <textarea v-model="form.notes" class="pixel-input-lg w-full h-full min-h-[150px] text-lg p-4 resize-none text-gray-300"></textarea>
                            </div>
                        </div>

                    </div>
                </transition>
            </div>

            <!-- Footer Actions -->
            <div class="p-6 border-t-2 border-gray-700 bg-gray-800 flex justify-between items-center z-10">
                <button v-if="step > 1" @click="step--" class="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded transition-colors text-lg">
                    <span>◀</span> BACK
                </button>
                <div v-else class="w-20"></div> <!-- Spacer -->

                <div class="flex gap-4">
                    <button v-if="step < 6" @click="step++" class="bg-neon-pink text-white px-8 py-3 rounded-sm hover:translate-y-0.5 hover:shadow-none shadow-[4px_4px_0px_#000] border border-white transition-all font-bold text-xl tracking-wider flex items-center gap-2">
                        NEXT <span>▶</span>
                    </button>
                    
                    <button v-show="step === 6" @click="submit" class="bg-green-600 text-white px-10 py-3 rounded-sm hover:bg-green-500 shadow-[0_0_15px_#00ff00] border-2 border-white transition-all font-bold text-xl animate-pulse tracking-widest flex items-center gap-2">
                        <span>💾</span> LAUNCH MISSION
                    </button>
                </div>
            </div>
        </div>
      </div>

       <!-- Success Overlay -->
       <div v-if="showSuccess" class="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 backdrop-blur-md">
          <h2 class="text-5xl text-neon-yellow mb-8 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">MISSION SAVED</h2>
          <div class="text-8xl animate-bounce mb-4">📜</div>
          <p class="text-gray-400 font-mono">Redirecting to command center...</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { saveStrategy } from '../services/googleSheet';

const props = defineProps(['isOpen']);
const emit = defineEmits(['close', 'refresh']);

const step = ref(1);
const showSuccess = ref(false);
const seed = Math.floor(Math.random() * 10000);
const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4`;

const form = ref({
  code: '', name: '', holdings: '', cost: '', currentPrice: '',
  warning: '', stopLoss: '', addPoint: '', tp1: '', tp2: '', targetPrice: '',
  strategy: '波段操作', notes: '', risk: '中', advice: ''
});

const questions = {
  1: "指揮官，請確認這次行動的目標代號？ (Identify Target)",
  2: "目前的部隊配置與資源狀態如何？ (Resource Status)",
  3: "我們需要設定多層防禦底線！ (Defense Lines)",
  4: "進攻目標與獲利了結點在哪裡？ (Attack Plan)",
  5: "請評估戰場風險並給出作戰指示！ (Risk Assessment)",
  6: "最後確認，這是一場什麼樣的戰役？ (Strategy Type)"
};

const currentQuestion = computed(() => questions[step.value]);

const getStepTitle = (s) => {
    switch(s) {
        case 1: return "TARGET IDENTIFICATION";
        case 2: return "STATUS REPORT";
        case 3: return "DEFENSE SYSTEMS";
        case 4: return "ATTACK PROTOCOLS";
        case 5: return "RISK ANALYSIS";
        case 6: return "FINAL STRATEGY";
        default: return "";
    }
}

const submit = async () => {
  showSuccess.value = true;
  
  // Save data
  try {
      await saveStrategy(form.value);
  } catch(e) {
      console.error("Save failed", e);
      alert("Save failed, check console");
  }

  setTimeout(() => {
    showSuccess.value = false;
    step.value = 1;
    form.value = { ...form.value, code: '', name: '', advice: '', risk: '中', targetPrice: '' }; 
    emit('refresh');
    emit('close');
  }, 2000);
};
</script>

<style scoped>
.pixel-card {
    image-rendering: pixelated;
}
.pixel-input-lg {
    @apply bg-black border-2 border-gray-600 text-white p-4 rounded-sm outline-none transition-colors;
}
.pixel-input-lg:focus {
    @apply border-neon-blue shadow-[0_0_10px_#00ffff];
}
.typing-container {
    display: inline-block;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar for inner content */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4a4a4a; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #666; 
}
</style>
