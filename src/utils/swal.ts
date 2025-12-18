// src/utils/swal.ts
import Swal from 'sweetalert2';

const themeColors = {
    primaryPink: '#FF6B9C',
    accentBlue: '#3B82F6',
    dangerRed: '#EF4444',
    successGreen: '#10B981',
    textDark: '#374151',
};

const DEFAULT_CLASSES = {
    popup: 'rounded-2xl shadow-xl border border-gray-100 font-sans',
    title: 'text-xl font-bold text-gray-800',
    htmlContainer: 'text-gray-600',
    confirmButton: 'px-6 py-2 ml-2 rounded-full font-bold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5',
    cancelButton: 'px-6 py-2 rounded-full font-bold text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all'
};

const baseMixin = Swal.mixin({
    buttonsStyling: false,
    customClass: DEFAULT_CLASSES
});

export const Toast = baseMixin.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

export const showSuccessModal = (title: string, text?: string) => {
    return baseMixin.fire({
        icon: 'success',
        title,
        text,
        confirmButtonText: '¡Genial!',
        confirmButtonColor: themeColors.successGreen,
        customClass: {
            ...DEFAULT_CLASSES,
            confirmButton: 'bg-green-500 ' + DEFAULT_CLASSES.confirmButton
        }
    });
};

export const showErrorModal = (title: string, text?: string) => {
    return baseMixin.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Entendido',
        customClass: {
            ...DEFAULT_CLASSES,
            confirmButton: 'bg-red-500 ' + DEFAULT_CLASSES.confirmButton
        }
    });
};

export const confirmAction = async (title: string, text: string, confirmBtnText = 'Sí, eliminar') => {
    const result = await baseMixin.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmBtnText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            ...DEFAULT_CLASSES,
            confirmButton: 'bg-red-500 ' + DEFAULT_CLASSES.confirmButton,
        }
    });
    return result.isConfirmed;
};