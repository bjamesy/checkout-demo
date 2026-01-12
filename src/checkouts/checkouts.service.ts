import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'

export enum CheckoutStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Injectable()
export class CheckoutsService {
    constructor(private prisma: PrismaService) {}

    async createCheckout(dto: CreateCheckoutDto) {
        try {
            // Try to create a new checkout
            const checkout = await this.prisma.checkout.create({
                data: {
                merchantId: dto.merchantId,
                amount: dto.amount,
                currency: dto.currency,
                status: CheckoutStatus.PENDING,
                idempotencyKey: dto.idempotencyKey,
                },
            })
            return checkout
        } catch (error: any) {
            // Check for unique constraint violation
            if (
                error.code === 'P2002' &&
                error.meta?.target?.includes('merchantId') &&
                error.meta?.target?.includes('idempotencyKey')
            ) {
                // Return the existing checkout instead of creating a duplicate
                return this.prisma.checkout.findFirst({
                    where: {
                        merchantId: dto.merchantId,
                        idempotencyKey: dto.idempotencyKey,
                    },
                })
            }
            throw error
        }
    }

    // 2️⃣ Get checkout by ID
    async getCheckout(id: string) {
        return this.prisma.checkout.findUnique({ where: { id } })
    }

    // 3️⃣ Process payment asynchronously
    async processPayment(id: string) {
        const checkout = await this.getCheckout(id)
        if (!checkout) throw new Error('Checkout not found')

        // Only process if still pending
        if (checkout.status !== 'PENDING') return checkout

        // Simulate async payment (1-2 seconds)
        setTimeout(async () => {
            const isSuccess = Math.random() > 0.3 // 70% chance success
            await this.prisma.checkout.update({
                where: { id },
                data: {
                    status: isSuccess ? 'COMPLETED' : 'FAILED',
                },
            })
        }, 1000) // 1 second delay

        return { ...checkout, status: 'PENDING' } // return current status immediately
    }
    
}
