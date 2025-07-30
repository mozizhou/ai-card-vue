import { DirectiveBinding } from 'vue';

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { value } = binding;
        if (!value || typeof value !== 'string') return;

        el.textContent = '';
        let index = 0;
        const speed = 30; // 打字速度，毫秒

        const typeWriter = () => {
            if (index < value.length) {
                el.textContent += value.charAt(index);
                index++;
                setTimeout(typeWriter, speed);
            }
        };

        typeWriter();
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
        // 当内容更新时重新执行打字效果
        if (binding.oldValue !== binding.value) {
            this.mounted(el, binding);
        }
    }
};