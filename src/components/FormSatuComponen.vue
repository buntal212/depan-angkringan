<template>
  <q-dialog v-model="dialogVisible" persistent transition-show="scale" transition-hide="scale">
    <q-card class="form-dialog-card bg-dark text-white" style="width: 500px; max-width: 95vw">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6 text-amber text-weight-bold">{{ dialogTitle }}</div>
        <q-space />
        <q-btn flat round dense icon="close" color="grey-5" @click="onCancel" />
      </q-card-section>

      <q-separator dark />

      <!-- Form Fields -->
      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="onSubmit" ref="formRef" class="q-gutter-y-md">
          <template v-for="field in fields" :key="field.name">
            <!-- Text Input -->
            <q-input
              v-if="field.type === 'text' || field.type === 'email'"
              v-model="formData[field.name]"
              :label="field.label"
              :type="field.type"
              dark
              outlined
              rounded
              color="amber"
              bg-color="grey-10"
              dense
              :rules="field.rules || []"
              lazy-rules
              :readonly="field.readonly || false"
            >
              <template v-if="field.icon" v-slot:prepend>
                <q-icon :name="field.icon" color="amber" />
              </template>
            </q-input>

            <!-- Number Input -->
            <q-input
              v-else-if="field.type === 'number'"
              v-model.number="formData[field.name]"
              :label="field.label"
              type="number"
              dark
              outlined
              rounded
              color="amber"
              bg-color="grey-10"
              dense
              :rules="field.rules || []"
              lazy-rules
              :prefix="field.prefix || ''"
            >
              <template v-if="field.icon" v-slot:prepend>
                <q-icon :name="field.icon" color="amber" />
              </template>
            </q-input>

            <!-- Currency Input (formatted number) -->
            <FormatNumberComponen
              v-else-if="field.type === 'currency'"
              v-model="formData[field.name]"
              :label="field.label"
              :icon="field.icon || ''"
              :prefix="field.prefix || ''"
              :rules="field.rules || []"
            />

            <!-- Textarea -->
            <q-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.name]"
              :label="field.label"
              type="textarea"
              dark
              outlined
              rounded
              color="amber"
              bg-color="grey-10"
              dense
              :rules="field.rules || []"
              lazy-rules
              autogrow
            >
              <template v-if="field.icon" v-slot:prepend>
                <q-icon :name="field.icon" color="amber" />
              </template>
            </q-input>

            <!-- Select -->
            <q-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.name]"
              :label="field.label"
              :options="field.options || []"
              dark
              outlined
              rounded
              color="amber"
              bg-color="grey-10"
              dense
              :rules="field.rules || []"
              lazy-rules
              emit-value
              map-options
            >
              <template v-if="field.icon" v-slot:prepend>
                <q-icon :name="field.icon" color="amber" />
              </template>
            </q-select>

            <!-- File / Image Upload -->
            <div v-else-if="field.type === 'file'">
              <div class="text-caption text-grey-5 q-mb-xs">{{ field.label }}</div>
              <!-- Preview gambar -->
              <div v-if="imagePreview[field.name]" class="q-mb-sm relative-position">
                <q-img
                  :src="imagePreview[field.name]"
                  :ratio="16 / 9"
                  class="rounded-borders"
                  style="max-height: 200px; border-radius: 12px"
                />
                <q-btn
                  round
                  dense
                  flat
                  icon="close"
                  color="red-5"
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  style="background: rgba(0, 0, 0, 0.6)"
                  @click="removeImage(field.name)"
                />
              </div>
              <q-file
                v-model="formData[field.name]"
                :label="imagePreview[field.name] ? 'Ganti gambar...' : 'Pilih gambar...'"
                dark
                outlined
                rounded
                color="amber"
                bg-color="grey-10"
                dense
                accept="image/*"
                :rules="field.rules || []"
                lazy-rules
                @update:model-value="(val) => onFileSelected(field.name, val)"
              >
                <template v-slot:prepend>
                  <q-icon name="image" color="amber" />
                </template>
              </q-file>
            </div>
          </template>

          <!-- Actions -->
          <div class="row justify-end q-gutter-sm q-pt-sm">
            <q-btn flat rounded label="Batal" color="grey-5" no-caps @click="onCancel" />
            <q-btn
              unelevated
              rounded
              :label="isEdit ? 'Update' : 'Simpan'"
              color="amber"
              text-color="black"
              class="text-weight-bold"
              no-caps
              type="submit"
              :loading="saving"
            >
              <template v-slot:loading>
                <q-spinner-facebook color="black" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import FormatNumberComponen from 'src/components/FormatNumberComponen.vue'

const props = defineProps({
  /** v-model untuk show/hide dialog */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Judul dialog saat tambah data */
  addTitle: {
    type: String,
    default: 'Tambah Data',
  },
  /** Judul dialog saat edit data */
  editTitle: {
    type: String,
    default: 'Edit Data',
  },
  /**
   * Definisi field form. Array of object:
   * { name: 'field_name', label: 'Label', type: 'text|number|textarea|select', icon: 'icon_name', rules: [...], options: [...], prefix: 'Rp' }
   */
  fields: {
    type: Array,
    required: true,
    default: () => [],
  },
  /** Data item yang sedang diedit (null = mode tambah) */
  editData: {
    type: Object,
    default: null,
  },
  /** Status loading saat simpan */
  saving: {
    type: Boolean,
    default: false,
  },
  idangkringan: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const formRef = ref(null)
const formData = reactive({})
const imagePreview = reactive({})

const isEdit = computed(() => props.editData !== null)
const dialogTitle = computed(() => (isEdit.value ? props.editTitle : props.addTitle))

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Inisialisasi / reset form data saat dialog dibuka
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      // Reset semua field
      props.fields.forEach((field) => {
        if (field.type === 'file') {
          formData[field.name] = null
          if (isEdit.value && props.editData && props.editData[field.name]) {
            imagePreview[field.name] = props.editData[field.name]
          } else {
            imagePreview[field.name] = null
          }
        } else if (isEdit.value && props.editData) {
          // khusus currency
          if (field.type === 'currency') {
            formData[field.name] = Number(props.editData[field.name] || 0)
          } else {
            formData[field.name] = props.editData[field.name] ?? field.default ?? ''
          }
        } else {
          formData[field.name] = field.default ?? ''
        }
      })
    }
  },
)

const onFileSelected = (fieldName, file) => {
  if (file) {
    imagePreview[fieldName] = URL.createObjectURL(file)
  }
}

const removeImage = (fieldName) => {
  formData[fieldName] = null
  imagePreview[fieldName] = null
}

const onSubmit = () => {
  formRef.value?.validate().then((success) => {
    if (success) {
      const payload = {
        ...formData,
        angkringan_id: props.idangkringan,
      }

      const hasFile = props.fields.some((f) => f.type === 'file' && payload[f.name] instanceof File)

      if (hasFile) {
        const fd = new FormData()

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            fd.append(key, payload[key])
          }
        })

        emit('save', fd, isEdit.value)
      } else {
        emit('save', payload, isEdit.value)
      }
    }
  })
}

const onCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

defineExpose({ formData, formRef })
</script>

<style scoped>
.form-dialog-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}
</style>
