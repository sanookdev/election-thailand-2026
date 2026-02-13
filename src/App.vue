<template>
  <v-app>
    <v-main class="bg-background">
      <v-container fluid class="pa-4 pa-md-8" style="max-width: 960px;">

        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-icon icon="mdi-ballot-outline" size="28" color="primary" class="mr-3" />
          <h1 class="text-h5 text-md-h4 font-weight-bold">ถอดรหัสบาร์โค้ดบัตรเลือกตั้งประเทศไทย 2569</h1>
        </div>

        

  

        <!-- Decoder Card -->
        <v-card class="mb-6" color="surface" rounded="lg" elevation="2">
          <v-card-title class="text-body-1 font-weight-medium pb-0 pt-4 px-4">
            <v-icon icon="mdi-qrcode-scan" size="20" class="mr-2" />
            ถอดรหัส: เลขที่บัตร → เล่มที่
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Input Row -->
            <div class="d-flex align-center ga-3">
              <v-text-field
                v-model="inputBallot"
                variant="outlined"
                density="comfortable"
                placeholder="เช่น A20516201"
                prepend-inner-icon="mdi-pound"
                hide-details
                clearable
                class="flex-grow-1"
                @keyup.enter="decode"
                color="primary"
              />
              <v-btn
                color="primary"
                size="large"
                variant="flat"
                @click="decode"
                :disabled="!inputBallot"
                min-width="120"
              >
                <v-icon icon="mdi-magnify" class="mr-1" />
                ถอดรหัส
              </v-btn>
            </div>

            <!-- Results -->
            <v-expand-transition>
              <div v-if="result" class="mt-5">
                <!-- Result Cards Row -->
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <v-card color="surface-variant" rounded="lg" class="pa-4 text-center result-card">
                      <div class="text-caption text-medium-emphasis mb-2">เลขที่บัตร (N)</div>
                      <div class="text-h6 font-weight-bold text-warning">{{ result.ballotDisplay }}</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card color="surface-variant" rounded="lg" class="pa-4 text-center result-card">
                      <div class="text-caption text-medium-emphasis mb-2">
                        → เล่มที่ (M)
                      </div>
                      <div class="d-flex align-center justify-center">
                        <span class="text-h6 font-weight-bold text-primary">{{ result.bookDisplay }}</span>
                        <v-btn
                          icon
                          variant="text"
                          size="x-small"
                          class="ml-1"
                          @click="copyToClipboard(result.bookDisplay)"
                        >
                          <v-icon icon="mdi-content-copy" size="16" />
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card color="surface-variant" rounded="lg" class="pa-4 text-center result-card">
                      <div class="text-caption text-medium-emphasis mb-2">ลำดับที่ในเล่ม</div>
                      <div class="text-h6 font-weight-bold text-success">ใบที่ {{ result.position }} / 20</div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Formula Display -->
                <v-sheet
                  color="rgba(255,109,0,0.08)"
                  rounded="lg"
                  class="pa-3 mt-4 formula-sheet"
                >
                  <code class="text-body-2 text-medium-emphasis formula-text">
                    M = ⌊N / 20⌋ + 1 = ⌊{{ result.N }} / 20⌋ + 1 = ⌊{{ result.divResult }}⌋ + 1 = {{ result.floorResult }} + 1 = {{ result.M }}
                  </code>
                </v-sheet>
              </div>
            </v-expand-transition>

            <!-- Sample Chips -->
            <div class="mt-4 d-flex align-center flex-wrap ga-2">
              <span class="text-caption text-medium-emphasis mr-1">ตัวอย่าง (จากแหล่งข่าวในสื่อ):</span>
              <v-chip
                v-for="sample in samples"
                :key="sample"
                size="small"
                variant="outlined"
                color="grey"
                class="sample-chip"
                @click="useSample(sample)"
              >
                {{ sample }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      <!-- Barcode Scanner Card -->
        <v-card class="mb-6" color="surface" rounded="lg" elevation="2">
          <v-card-title class="text-body-1 font-weight-medium pb-0 pt-4 px-4">
            <v-icon icon="mdi-camera" size="20" class="mr-2" />
            สแกนบาร์โค้ดจากภาพ
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Upload Area -->
            <div
              class="upload-area rounded-lg pa-6 text-center"
              :class="{ 'upload-area--active': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                hidden
                @change="handleFileSelect"
              />
              <v-icon icon="mdi-cloud-upload-outline" size="48" color="primary" class="mb-2" />
              <div class="text-body-1 mb-1">คลิกหรือลากภาพมาวาง</div>
              <div class="text-caption text-medium-emphasis">รองรับ JPG, PNG — ภาพบัตรเลือกตั้งที่มีบาร์โค้ด</div>
            </div>

            <!-- Preview & Scan Results -->
            <v-expand-transition>
              <div v-if="scanPreview" class="mt-4">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-img :src="scanPreview" max-height="200" rounded="lg" cover class="border" />
                  </v-col>
                  <v-col cols="12" sm="6" class="d-flex flex-column justify-center">
                    <div v-if="scanning" class="text-center">
                      <v-progress-circular indeterminate color="primary" size="32" class="mb-2" />
                      <div class="text-body-2 text-medium-emphasis">กำลังสแกนบาร์โค้ด...</div>
                    </div>
                    <div v-else-if="scanResults.length > 0">
                      <div class="text-caption text-medium-emphasis mb-2">
                        <v-icon icon="mdi-barcode-scan" size="16" class="mr-1" />
                        พบบาร์โค้ด {{ scanResults.length }} รายการ
                      </div>
                      <div v-for="(code, idx) in scanResults" :key="idx" class="mb-2">
                        <v-chip
                          color="primary"
                          variant="flat"
                          class="mr-2 font-weight-bold"
                          @click="useScanResult(code.decoded)"
                        >
                          {{ code.decoded }}
                        </v-chip>
                        <span class="text-caption text-medium-emphasis">(raw: {{ code.raw }})</span>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-2">
                        <v-icon icon="mdi-information-outline" size="14" class="mr-1" />
                        คลิกที่ผลลัพธ์เพื่อนำไปถอดรหัส
                      </div>
                    </div>
                    <div v-else-if="scanError">
                      <v-alert type="warning" variant="tonal" density="compact" class="text-body-2">
                        {{ scanError }}
                      </v-alert>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <!-- Prefix Mapping Info -->
            <div class="mt-3 d-flex align-center ga-2 flex-wrap">
              <v-icon icon="mdi-information-outline" size="16" color="info" />
              <span class="text-caption text-medium-emphasis">
                แปลงตัวเลขนำหน้า: 0 → A, 1 → B
              </span>
            </div>

            <!-- Dynamsoft Fallback Tip (always visible) -->
            <v-alert type="info" variant="tonal" density="compact" class="text-body-2 mt-3">
              <div class="mb-1"><strong>💡 สแกนภาพไม่ชัด / เอียง:</strong></div>
              <div>
                หากอัพโหลดภาพแล้วไม่พบบาร์โค้ด ให้ไปที่
                <a href="https://demo.dynamsoft.com/barcode-reader/" target="_blank" rel="noopener" class="dynamsoft-link">
                  Dynamsoft Barcode Reader Demo
                  <v-icon icon="mdi-open-in-new" size="12" />
                </a>
                แล้วอัพโหลดภาพเดิม — ระบบจะถอดรหัสบาร์โค้ดออกมาเป็นเลขที่
                แล้วนำมากรอกในช่อง "เลขที่บัตรเลือกตั้ง" ด้านล่างได้เลย
              </div>
              <div class="mt-3">
                <div class="text-caption text-medium-emphasis mb-1">📸 ตัวอย่างผลลัพธ์จาก Dynamsoft:</div>
                <img
                  src="/dynamsoft-example.png"
                  alt="ตัวอย่างผลลัพธ์การสแกนบาร์โค้ดจาก Dynamsoft - CODE_128 A20516201"
                  style="width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);"
                />
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
        <!-- Flow Diagram -->
        <div class="flow-diagram d-flex align-center flex-wrap ga-2 mb-6">
               <v-card-title class="text-body-1 font-weight-medium pb-0 pt-4 px-4">
            <v-icon icon="mdi-qrcode-scan" size="20" class="mr-2" />
            ค้นหาต้นขั้วยังไง ?
          </v-card-title>
          <span class="flow-label text-medium-emphasis">บาร์โค้ด</span>
          <v-icon icon="mdi-arrow-right" size="16" color="grey" />
          <v-chip size="small" color="warning" variant="flat" class="font-weight-medium">เลขที่ (N)</v-chip>
          <v-icon icon="mdi-arrow-right" size="16" color="grey" />
          <v-chip size="small" color="primary" variant="flat" class="font-weight-medium">เล่มที่ (M)</v-chip>
          <v-icon icon="mdi-arrow-right" size="16" color="grey" />
          <v-chip size="small" color="error" variant="flat" class="font-weight-medium">ต้นขั้ว</v-chip>
          <v-icon icon="mdi-arrow-right" size="16" color="grey" />
          <v-chip size="small" color="error" variant="flat" class="font-weight-medium bg-secondary">ลายเซ็น + ลำดับ</v-chip>

          <v-icon icon="mdi-arrow-right" size="16" color="grey" />
          <v-chip size="small" color="error" variant="flat" class="font-weight-medium bg-success">ตัวตนผู้ลงคะแนน</v-chip>
        </div>

        <!-- Example Calculation & Code Section -->
        <v-card class="mb-6" color="surface" rounded="lg" elevation="2">
          <v-card-text class="pa-4">
            <!-- Example Calculation -->
            <v-sheet color="surface-variant" rounded="lg" class="pa-4 mb-5">
              <div class="text-body-2 mb-3">
                <v-icon icon="mdi-lightbulb" size="16" color="warning" class="mr-1" />
                <span class="font-weight-bold text-medium-emphasis">ตัวอย่าง</span>
              </div>
              <pre class="example-calc text-body-2 text-medium-emphasis">บาร์โค้ด:  <span class="text-warning">A03398985</span>
N = 3398985
M = ⌊3398985 / 20⌋ + 1
  = ⌊169949.25⌋ + 1
  = 169949 + 1 = <span class="text-primary font-weight-bold">169950</span>
เล่มที่ = <span class="text-warning font-weight-bold">A0169950</span>
ลำดับในเล่ม = 3398985 mod 20
  = <span class="font-weight-bold">5</span>  (ใบที่ 5 จาก 20)</pre>
            </v-sheet>

            <!-- JavaScript Code -->
            <div class="text-body-1 font-weight-bold mb-3">การคำนวนด้วย JavaScript:</div>
            <v-sheet color="surface-variant" rounded="lg" class="pa-4 code-block">
              <pre class="text-body-2"><code class="text-medium-emphasis">function getBallotBookId(ballotId) {
  const prefix = ballotId.slice(0, 1);
  const N = parseInt(ballotId.slice(1), 10);
  const start = Math.floor(N / 20);
  return prefix + String(start + 1).padStart(7, "0");
}</code></pre>
            </v-sheet>

            <!-- CodePen Link -->
            <div class="mt-4">
              <a
                href="https://codepen.io/earthchie/pen/vEKbZBb?editors=1010"
                target="_blank"
                rel="noopener noreferrer"
                class="codepen-link text-body-2"
              >
                <v-icon icon="mdi-open-in-new" size="14" class="mr-1" />
                เปิด CodePen ต้นฉบับ (earthchie)
              </a>
            </div>
          </v-card-text>
        </v-card>

        <!-- Warning Alert -->
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="mb-6"
          density="comfortable"
        >
          <template #title>
            <span class="text-h2 font-weight-bold">⚠</span>
          </template>
          <div class="text-body-2 mt-1" style="line-height: 1.7;">
<span class="text-warning font-weight-bold">บาร์โค้ดที่มีเลขเฉพาะไม่ซ้ำกัน</span>แต่ละใบ
            ซึ่งสามารถคำนวณย้อนกลับหา<span class="text-warning font-weight-bold">เล่มที่</span>ของบัตรได้ด้วยสูตรง่ายๆ —
            <br>เมื่อรู้เล่มที่ → ก็รู้ต้นขั้ว → ต้นขั้วมีลายเซ็นและลำดับที่ผู้ลงคะแนน →
            <span class="text-primary font-weight-bold text-decoration-underline">ทำให้รู้ว่าใครกาเบอร์อะไรได้</span>
            <br />
            ตาม รธน. การเลือกตั้งต้องเป็นไปโดย "ลับ" — หากสืบย้อนได้ ขัดรัฐธรรมนูญ
          </div>
        </v-alert>

        <!-- Relevant Laws Section -->
        <v-card class="mb-6" color="surface" rounded="lg" elevation="2">
          <v-expansion-panels variant="accordion" flat>
            <v-expansion-panel bg-color="transparent">
              <v-expansion-panel-title class="text-body-1 font-weight-medium">
                <v-icon icon="mdi-scale-balance" size="20" class="mr-2" color="amber" />
                กฎหมายที่เกี่ยวข้อง — พ.ร.บ.ประกอบ รธน. เลือกตั้ง ส.ส.
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-body-2 mb-4" style="line-height: 1.7;">
                  บาร์โค้ดที่มีเลขเฉพาะแต่ละใบ สามารถคำนวณย้อนหาเล่มที่ → ต้นขั้ว → ตัวตนผู้ลงคะแนนได้ ซึ่งอาจขัดต่อกฎหมายเลือกตั้งอย่างน้อย <strong class="text-warning">3 มาตรา</strong>
                </div>

                <!-- มาตรา 92 -->
                <v-card variant="outlined" class="mb-3 pa-3" color="surface-variant" rounded="lg">
                  <div class="d-flex align-center mb-2">
                    <v-chip size="small" color="warning" variant="flat" class="font-weight-bold mr-2">มาตรา 92</v-chip>
                    <span class="text-body-2 font-weight-bold text-primary">การลงคะแนน "โดยตรงและลับ"</span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis" style="line-height: 1.7;">
                    กำหนดให้การลงคะแนนเลือกตั้งเป็นไปโดย <strong class="text-warning">"โดยตรงและลับ"</strong> — หากบาร์โค้ดสามารถสืบย้อนตัวตนผู้ลงคะแนนได้ ย่อมขัดต่อหลัก "ลับ" ที่กฎหมายบัญญัติไว้
                  </div>
                </v-card>

                <!-- มาตรา 93 -->
                <v-card variant="outlined" class="mb-3 pa-3" color="surface-variant" rounded="lg">
                  <div class="d-flex align-center mb-2">
                    <v-chip size="small" color="info" variant="flat" class="font-weight-bold mr-2">มาตรา 93</v-chip>
                    <span class="text-body-2 font-weight-bold text-primary">บังคับพับบัตร — ไม่ให้ผู้อื่นทราบว่าลงคะแนนอย่างไร</span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis" style="line-height: 1.7;">
                    บังคับให้ <strong class="text-info">พับบัตร</strong> ก่อนหย่อนลงหีบ เพื่อไม่ให้ผู้อื่นทราบว่าลงคะแนนอย่างไร — แต่หากบาร์โค้ดด้านนอกบัตรสามารถอ่านได้โดยไม่ต้องเปิดบัตร การพับบัตรก็ไม่ช่วยปกป้องความลับ
                  </div>
                </v-card>

                <!-- มาตรา 96 -->
                <v-card variant="outlined" class="mb-3 pa-3" color="surface-variant" rounded="lg">
                  <div class="d-flex align-center mb-2">
                    <v-chip size="small" color="error" variant="flat" class="font-weight-bold mr-2">มาตรา 96</v-chip>
                    <span class="text-body-2 font-weight-bold text-primary">ห้ามทำเครื่องหมายที่สังเกตได้บนบัตร</span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis" style="line-height: 1.7;">
                    ห้ามทำ <strong class="text-error">เครื่องหมายที่ทำให้สังเกตได้</strong> บนบัตรเลือกตั้ง — บาร์โค้ดที่มีเลขเฉพาะไปซ่ำกับแต่ละใบ ถือเป็นเครื่องหมายที่สามารถแยกและบ่งบอกจากบัตรแต่ละใบออกจากกันได้ จึงอาจเข้าข่ายเป็น "เครื่องหมายที่ทำให้สังเกตได้" ตามมาตรานี้
                  </div>
                </v-card>

                <!-- ข้อสังเกต -->
                <v-alert type="warning" variant="tonal" density="compact" class="text-body-2 mt-2">
                  <div class="mb-1"><strong>⚠ ข้อสังเกต</strong></div>
                  <div style="line-height: 1.7;">
                    กฎหมายเลือกตั้งออกแบบเพื่อปกป้อง <strong class="text-warning">ความลับของผู้ลงคะแนน</strong> ทั้ง 3 มาตรานี้มุ่งเน้นเรื่องเดียวกัน — ไม่ให้มีทางสืบข้อได้ว่าใครลงคะแนนให้ใคร หากบาร์โค้ดสามารถย้อนหาตัวตนได้จริง ย่อมเป็นช่องทางที่ขัดต่อเจตนารมณ์ของกฎหมาย
                  </div>
                </v-alert>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>

        <!-- History Section -->
        <v-card v-if="history.length > 0" color="surface" rounded="lg" elevation="2">
          <v-card-title class="text-body-1 font-weight-medium py-3 px-4">
            <v-icon icon="mdi-history" size="20" class="mr-2" />
            ประวัติการถอดรหัส ({{ history.length }})
          </v-card-title>

          <v-divider />

          <v-table density="comfortable" class="bg-surface">
            <thead>
              <tr>
                <th class="text-left">เลขที่บัตร (N)</th>
                <th class="text-left">เล่มที่ (M)</th>
                <th class="text-center">ลำดับในเล่ม</th>
                <th class="text-left">สูตร</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in history" :key="i">
                <td class="text-warning font-weight-medium">{{ item.ballotDisplay }}</td>
                <td class="text-primary font-weight-medium">{{ item.bookDisplay }}</td>
                <td class="text-center">{{ item.position }} / 20</td>
                <td>
                  <code class="text-caption text-medium-emphasis">
                    ⌊{{ item.N }} / 20⌋ + 1 = ⌊{{ item.divResult }}⌋ + 1 = {{ item.floorResult }} + 1 = {{ item.M }}
                  </code>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Snackbar for copy -->
        <v-snackbar v-model="snackbar" :timeout="2000" color="success" location="bottom">
          คัดลอกแล้ว!
        </v-snackbar>

      </v-container>

      <!-- Hidden container for html5-qrcode -->
      <div id="scanner-container" style="display: none;"></div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Quagga from '@ericblade/quagga2'

const inputBallot = ref('')
const result = ref(null)
const history = ref([])
const snackbar = ref(false)

// Scanner state
const isDragging = ref(false)
const scanPreview = ref(null)
const scanning = ref(false)
const scanResults = ref([])
const scanError = ref(null)
const fileInput = ref(null)

const samples = ['A37805049', 'A37805050', 'A37805055', 'A37804930', 'A20516201']

// Prefix mapping: first digit → letter
const prefixMap = { '0': 'A', '1': 'B' }

function mapBarcodePrefix(rawBarcode) {
  const str = String(rawBarcode).trim()
  // If it already starts with a letter, return as-is
  if (/^[A-Z]/i.test(str)) return str.toUpperCase()
  // Map first digit to letter
  const firstChar = str.charAt(0)
  const prefix = prefixMap[firstChar]
  if (prefix) {
    return prefix + str.slice(1)
  }
  // Fallback: return with 'A' prefix
  return 'A' + str
}

// Handle file drag & drop
function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

// Handle file input selection
function handleFileSelect(e) {
  const file = e.target?.files?.[0]
  if (file) processFile(file)
  // Reset input so the same file can be selected again
  if (e.target) e.target.value = ''
}

// Scan barcode from an image source using Quagga2
function scanWithQuagga(src, patchSize = 'medium') {
  return new Promise((resolve) => {
    Quagga.decodeSingle({
      src,
      numOfWorkers: 0,
      locate: true,
      inputStream: {
        size: 1600,
      },
      decoder: {
        readers: [
          'code_128_reader',
          'code_39_reader',
          'ean_reader',
          'ean_8_reader',
          'i2of5_reader',
        ],
        multiple: true,
      },
      locator: {
        patchSize,
        halfSample: true,
      },
    }, (scanResult) => {
      if (scanResult && scanResult.codeResult) {
        resolve([scanResult.codeResult])
      } else {
        resolve([])
      }
    })
  })
}

// Create a cropped version of the image (top portion where barcode usually is)
function cropImageTop(imgSrc, ratio = 0.35) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = Math.floor(img.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, canvas.height, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.onerror = () => resolve(null)
    img.src = imgSrc
  })
}

// Process uploaded file
async function processFile(file) {
  if (!file.type.startsWith('image/')) return

  // Show preview
  const objectUrl = URL.createObjectURL(file)
  scanPreview.value = objectUrl
  scanResults.value = []
  scanError.value = null
  scanning.value = true

  try {
    const allResults = []

    // Attempt 1: Scan full image with medium patch
    const r1 = await scanWithQuagga(objectUrl, 'medium')
    allResults.push(...r1)

    // Attempt 2: Full image with large patch (better for blurry)
    if (allResults.length === 0) {
      const r2 = await scanWithQuagga(objectUrl, 'large')
      allResults.push(...r2)
    }

    // Attempt 3: Crop top 30% (ballot barcodes are typically at the top)
    if (allResults.length === 0) {
      const croppedSrc = await cropImageTop(objectUrl, 0.3)
      if (croppedSrc) {
        const r3 = await scanWithQuagga(croppedSrc, 'medium')
        allResults.push(...r3)
      }
    }

    // Attempt 4: Crop top 50% with large patch
    if (allResults.length === 0) {
      const croppedSrc2 = await cropImageTop(objectUrl, 0.5)
      if (croppedSrc2) {
        const r4 = await scanWithQuagga(croppedSrc2, 'large')
        allResults.push(...r4)
      }
    }

    // Attempt 5: Small patch for small barcodes
    if (allResults.length === 0) {
      const r5 = await scanWithQuagga(objectUrl, 'small')
      allResults.push(...r5)
    }

    // De-duplicate results
    const seen = new Set()
    const unique = allResults.filter(r => {
      const code = r.code
      if (!code || seen.has(code)) return false
      seen.add(code)
      return true
    })

    if (unique.length > 0) {
      scanResults.value = unique.map(r => ({
        raw: r.code,
        decoded: mapBarcodePrefix(r.code),
        format: r.format,
      }))
    } else {
      scanError.value = 'ไม่พบบาร์โค้ดในภาพ — ลองถ่ายภาพให้ชัดขึ้น หรือครอปเฉพาะส่วนบาร์โค้ด'
    }
  } catch (err) {
    console.error('Scan error:', err)
    scanError.value = 'เกิดข้อผิดพลาดในการสแกน — ลองอัพโหลดภาพใหม่'
  } finally {
    scanning.value = false
  }
}

// Use scanned result in decoder
function useScanResult(code) {
  inputBallot.value = code
  decode()
  // Scroll to decoder result
  document.querySelector('.result-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function decode() {
  if (!inputBallot.value) return

  const raw = inputBallot.value.trim().toUpperCase()
  // Extract prefix (letters) and numeric part
  const match = raw.match(/^([A-Z]*)(\d+)$/)
  if (!match) return

  const prefix = match[1] || ''
  const N = parseInt(match[2], 10)
  if (isNaN(N)) return

  const divResult = N / 20
  const floorResult = Math.floor(divResult)
  const M = floorResult + 1
  const remainder = N % 20
  const position = remainder === 0 ? 20 : remainder

  const decoded = {
    ballotDisplay: raw,
    bookDisplay: prefix + M,
    N,
    M,
    divResult: divResult % 1 === 0 ? divResult.toFixed(1) : parseFloat(divResult.toFixed(4)),
    floorResult,
    position,
  }

  result.value = decoded

  // Add to history (avoid duplicates, most recent first)
  const existingIndex = history.value.findIndex(h => h.ballotDisplay === decoded.ballotDisplay)
  if (existingIndex !== -1) {
    history.value.splice(existingIndex, 1)
  }
  history.value.unshift(decoded)
}

function useSample(sample) {
  inputBallot.value = sample
  decode()
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    snackbar.value = true
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    snackbar.value = true
  }
}
</script>

<style>
/* Global styles */
html {
  overflow-y: auto !important;
}

.result-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(13, 115, 119, 0.12) !important;
}

.formula-sheet {
  border-left: 3px solid #0D7377;
}

.formula-text {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
  background: transparent !important;
  word-break: break-all;
}

.sample-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.sample-chip:hover {
  border-color: #0D7377 !important;
  color: #0D7377 !important;
}

/* Table row hover */
.v-table tbody tr:hover {
  background: rgba(13, 115, 119, 0.04) !important;
}

/* Flow diagram */
.flow-diagram {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.flow-label {
  font-size: 0.8rem;
}

/* Example calculation */
.example-calc {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.8;
}

/* Code block */
.code-block pre {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
  line-height: 1.7;
}

.code-block code {
  background: transparent !important;
  font-family: inherit !important;
}

/* CodePen link */
.codepen-link {
  color: #1976D2 !important;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.codepen-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.dynamsoft-link {
  color: #0D7377;
  text-decoration: none;
  font-weight: 600;
}

.dynamsoft-link:hover {
  text-decoration: underline;
  opacity: 0.9;
}

/* Upload area */
.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.01);
}

.upload-area:hover {
  border-color: #0D7377;
  background: rgba(13, 115, 119, 0.04);
}

.upload-area--active {
  border-color: #0D7377;
  background: rgba(13, 115, 119, 0.08);
  transform: scale(1.01);
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
