# Helpers

## redirect

This is a shortcut for sending 30x responses.

```vue
<script>
import { redirect } from 'numix/server'
import { prisma } from '@/lib/prisma.server'

export async function loader(event) {
  try {
    const result = await prisma.product.findFirstOrThrow({
      where: {
        id: Number(event.params.id),
      },
    })
    return result
  }
  catch {
    return redirect(event, '/products')
  }
}
</script>
```
