import { BadRequestException, Body, Controller, HttpException, HttpStatus, Param, Patch } from "@nestjs/common";
import { UpdatePostInput } from "./dto/update-post.input";
import { PostService } from "./post.service";

@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() updatePostDto: UpdatePostInput,
    ) {
        try {
            if (isNaN(+id)) {
                throw new BadRequestException('ID inválido');
            }
            return await this.postService.update(+id, updatePostDto);
        } catch (error) {
            console.error('Erro no controller:', error);
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Erro ao atualizar post',
                details: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }
}