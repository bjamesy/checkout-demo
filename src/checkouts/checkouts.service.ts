import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'
import { CheckoutStatus } from './enums/checkout.enums'


@Injectable()
export class CheckoutsService {
    constructor(private prisma: PrismaService) {}

    async createCheckout(dto: CreateCheckoutDto) {
        try {
            // try to create a new checkout
            const checkout = await this.prisma.checkout.create({
                data: {
                merchantId: dto.merchantId,
                amount: dto.amount,
                currency: dto.currency,
                status: CheckoutStatus.PENDING,
                idempotencyKey: dto.idempotencyKey,
                },
            })

            return { checkout, created: true }
        } catch (error: any) {
            // check for unique constraint violation
            if (error.code === 'P2002') {
                const checkout = await this.prisma.checkout.findFirst({
                    where: {
                        merchantId: dto.merchantId,
                        idempotencyKey: dto.idempotencyKey,
                    },
                })

                if (checkout) return { checkout, created: false }
            }
            
            throw error
        }
    }

    async getCheckout(id: string) {
        const checkout = await this.prisma.checkout.findUnique({ where: { id } })
        if (!checkout) throw new NotFoundException('Checkout not found')

        return { id: checkout.id, status: checkout.status }
    }

    private async _getCheckout(id: string) {
        return this.prisma.checkout.findUnique({ where: { id } })
    }

    async processPayment(id: string) {
        const checkout = await this._getCheckout(id)
        if (!checkout) throw new NotFoundException('Checkout not found')

        if (checkout.status == CheckoutStatus.COMPLETED) {
            throw new BadRequestException(`Checkout ${id} already ${checkout.status}`)
        }

        // simulate async payment
        setTimeout(async () => {
            try {
                const isSuccess = Math.random() > 0.3 // 70% success rate
                await this.prisma.checkout.update({
                    where: { id },
                    data: { status: isSuccess ? CheckoutStatus.COMPLETED : CheckoutStatus.FAILED },
                })
            } catch (err) {
                console.error(`Error updating checkout ${id}:`, err)
            }
        }, 2000) // 2 second delay

        return { ...checkout, status: checkout.status }
    }
}
